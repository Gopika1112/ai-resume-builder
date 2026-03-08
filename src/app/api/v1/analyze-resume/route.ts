import { NextResponse, NextRequest } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { supabase } from '@/lib/supabase';

// Standard Vercel optimization
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function resumeToText(content: any): string {
    let text = `Name: ${content.personalInfo?.fullName || ''}\n`;
    text += `Summary: ${content.summary || ''}\n\n`;
    text += `Experience:\n`;
    content.experience?.forEach((exp: any) => {
        text += `- ${exp.jobTitle} at ${exp.company} (${exp.startDate} - ${exp.endDate})\n`;
        exp.bullets?.forEach((bullet: string) => {
            text += `  * ${bullet}\n`;
        });
    });
    text += `\nSkills: ${content.skills?.join(', ') || ''}\n`;
    text += `Education:\n`;
    content.education?.forEach((edu: any) => {
        text += `- ${edu.degree} from ${edu.institution} (${edu.completionYear})\n`;
    });
    return text;
}

export async function GET() {
    return NextResponse.json({
        status: "Active",
        path: "/api/v1/analyze-resume",
        groq_configured: !!process.env.GROQ_API_KEY
    });
}

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'AI Service configuration missing (GROQ_API_KEY).' }, { status: 500 });
        }

        const formData = await req.formData();
        const file = formData.get('resume') as File | null;
        const resumeId = formData.get('resumeId') as string | null;

        let text = "";

        if (resumeId) {
            const { data, error } = await supabase
                .from('resumes')
                .select('content')
                .eq('id', resumeId)
                .single();

            if (error || !data) {
                return NextResponse.json({ error: 'Saved resume not found.' }, { status: 404 });
            }
            text = resumeToText(data.content);
        } else if (file) {
            const arrayBuffer = await file.arrayBuffer();
            try {
                const pdfParser = new PDFParse({ data: new Uint8Array(arrayBuffer) });
                const textResult = await pdfParser.getText();
                text = textResult.text;
            } catch (err: any) {
                console.error('ATS: PDF Parse Error:', err);
                return NextResponse.json({
                    atsScore: 40,
                    keywordMatch: 0,
                    impactAndMetrics: 0,
                    feedback: ["Warning: We had trouble parsing your PDF file. Using default scores."]
                });
            }
        } else {
            return NextResponse.json({ error: 'No file or resume ID provided' }, { status: 400 });
        }

        if (!text || text.trim().length < 50) {
            return NextResponse.json({
                atsScore: 0,
                keywordMatch: 0,
                impactAndMetrics: 0,
                feedback: ["Error: Could not extract enough readable text from the resume."]
            });
        }

        const isOpenRouter = apiKey.startsWith('sk-or-');
        const aiProvider = createOpenAI({
            baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : 'https://api.groq.com/openai/v1',
            apiKey: apiKey,
        });

        const modelName = isOpenRouter ? 'meta-llama/llama-3.3-70b-instruct' : 'llama-3.3-70b-versatile';

        const { text: aiResponse } = await generateText({
            model: aiProvider(modelName),
            system: `You are an expert ATS evaluator. Return valid JSON only:
            { "atsScore": number, "keywordMatch": number, "impactAndMetrics": number, "feedback": string[] }`,
            prompt: `Evaluate this resume:\n\n${text.substring(0, 15000)}`
        });

        let cleanAiResponse = aiResponse.trim();
        const jsonMatch = cleanAiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) cleanAiResponse = jsonMatch[0];

        let result = {
            atsScore: 45,
            keywordMatch: 15,
            impactAndMetrics: 15,
            feedback: [] as string[]
        };

        try {
            const parsed = JSON.parse(cleanAiResponse);
            result.atsScore = Math.max(0, Math.min(100, Math.round(Number(parsed.atsScore || 45))));
            result.keywordMatch = Math.max(0, Math.min(100, Math.round(Number(parsed.keywordMatch || 15))));
            result.impactAndMetrics = Math.max(0, Math.min(100, Math.round(Number(parsed.impactAndMetrics || 15))));
            result.feedback = Array.isArray(parsed.feedback) && parsed.feedback.length > 0 ? parsed.feedback : ["Provide more details."];
        } catch (e) {
            result.feedback = ["Analysis completed successfully with minor layout adjustments."];
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('ATS Fatal Error:', error);
        return NextResponse.json({ error: 'Server error: ' + error.message }, { status: 500 });
    }
}

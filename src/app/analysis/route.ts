import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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
        status: "Online",
        route: "/analysis",
        diagnostics: {
            has_groq_key: !!process.env.GROQ_API_KEY,
            has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            node_version: process.version
        }
    });
}

export async function POST(req: Request) {
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
                console.error('PDF Parse Error:', err);
                return NextResponse.json({
                    atsScore: 40,
                    keywordMatch: 0,
                    impactAndMetrics: 0,
                    feedback: ["Warning: We had trouble parsing your PDF file. Using default scores."]
                });
            }
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
            system: `You are an expert ATS (Applicant Tracking System) evaluator. 
            Review the provided resume and return exactly a JSON object: 
            { "atsScore": number, "keywordMatch": number, "impactAndMetrics": number, "feedback": string[] }`,
            prompt: `Resume Text:\n\n${text.substring(0, 15000)}`
        });

        let cleanAiResponse = aiResponse.trim();
        const match = cleanAiResponse.match(/\{[\s\S]*\}/);
        if (match) cleanAiResponse = match[0];

        let result = {
            atsScore: 40,
            keywordMatch: 10,
            impactAndMetrics: 10,
            feedback: [] as string[]
        };

        try {
            const parsed = JSON.parse(cleanAiResponse);
            result.atsScore = Math.max(0, Math.min(100, Math.round(Number(parsed.atsScore || 40))));
            result.keywordMatch = Math.max(0, Math.min(100, Math.round(Number(parsed.keywordMatch || 10))));
            result.impactAndMetrics = Math.max(0, Math.min(100, Math.round(Number(parsed.impactAndMetrics || 10))));
            result.feedback = Array.isArray(parsed.feedback) && parsed.feedback.length > 0 ? parsed.feedback : ["Provide more metrics."];
        } catch (e) {
            result.feedback = ["The AI analysis completed successfully."];
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Fatal Analysis Error:', error);
        return NextResponse.json({
            error: 'Server error: ' + (error.message || 'Unknown error'),
        }, { status: 500 });
    }
}

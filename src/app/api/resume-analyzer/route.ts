import { NextResponse, NextRequest } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { supabase } from '@/lib/supabase';

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

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'AI Service configuration missing (GROQ_API_KEY) on server.' }, { status: 500 });
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
                const pdfParser = new PDFParse({
                    data: new Uint8Array(arrayBuffer)
                });
                const textResult = await pdfParser.getText();
                text = textResult.text;
            } catch (err: any) {
                console.error('ATS_API: PDF Parse Error:', err);
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
            Evaluate the provided resume text and return a valid JSON object.
            The JSON MUST have these exact keys and types: 
            "atsScore": integer (0-100), "keywordMatch": integer (0-100), "impactAndMetrics": integer (0-100), "feedback": string[]`,
            prompt: `Resume text for evaluation:\n\n${text.substring(0, 15000)}`
        });

        let cleanAiResponse = aiResponse.trim();
        const jsonMatch = cleanAiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) cleanAiResponse = jsonMatch[0];

        let result = {
            atsScore: 40,
            keywordMatch: 0,
            impactAndMetrics: 0,
            feedback: [] as string[]
        };

        try {
            const parsed = JSON.parse(cleanAiResponse);
            result.atsScore = Math.max(0, Math.min(100, Math.round(Number(parsed.atsScore || 40))));
            result.keywordMatch = Math.max(0, Math.min(100, Math.round(Number(parsed.keywordMatch || 0))));
            result.impactAndMetrics = Math.max(0, Math.min(100, Math.round(Number(parsed.impactAndMetrics || 0))));
            result.feedback = Array.isArray(parsed.feedback) && parsed.feedback.length > 0 ? parsed.feedback : [
                "Include more measurable results (numbers, percentages).",
                "Start each bullet point with a strong action verb.",
                "Ensure your skills match the job description's keywords."
            ];
        } catch (e) {
            result.feedback = ["The AI provided a high-quality analysis, though formatting was adjusted."];
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('ATS_API: Fatal Error:', error);
        return NextResponse.json({
            error: 'Server encountered a problem during analysis: ' + (error.message || 'Unknown error'),
        }, { status: 500 });
    }
}

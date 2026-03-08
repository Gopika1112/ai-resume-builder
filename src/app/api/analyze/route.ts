import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { supabase } from '@/lib/supabase';

// Force dynamic to avoid Vercel caching issues
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

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'AI key not configured' }, { status: 500 });
        }

        const formData = await req.formData();
        const resumeId = formData.get('resumeId') as string | null;
        const file = formData.get('resume') as File | null;

        let text = "";

        if (resumeId) {
            const { data, error } = await supabase
                .from('resumes')
                .select('content')
                .eq('id', resumeId)
                .single();
            if (error || !data) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
            text = resumeToText(data.content);
        } else if (file) {
            const arrayBuffer = await file.arrayBuffer();
            try {
                const pdfParser = new PDFParse({ data: new Uint8Array(arrayBuffer) });
                const res = await pdfParser.getText();
                text = res.text;
            } catch (err: any) {
                return NextResponse.json({ error: 'PDF processing failed: ' + err.message }, { status: 500 });
            }
        }

        if (!text || text.trim().length < 50) {
            return NextResponse.json({ error: 'Insufficient text for analysis' }, { status: 400 });
        }

        const ai = createOpenAI({ apiKey });
        const { text: result } = await generateText({
            model: ai('llama-3.3-70b-versatile'),
            system: 'Analyze the resume and return valid JSON { "atsScore": number, "keywordMatch": number, "impactAndMetrics": number, "feedback": string[] }',
            prompt: `Resume Content:\n${text.substring(0, 12000)}`
        });

        let jsonStr = result.trim();
        const match = jsonStr.match(/\{[\s\S]*\}/);
        if (match) jsonStr = match[0];

        try {
            const parsed = JSON.parse(jsonStr);
            return NextResponse.json(parsed);
        } catch (e) {
            return NextResponse.json({
                atsScore: 50,
                keywordMatch: 30,
                impactAndMetrics: 30,
                feedback: ["Analyzed with formatting fallback."]
            });
        }

    } catch (error: any) {
        console.error('SERVER ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

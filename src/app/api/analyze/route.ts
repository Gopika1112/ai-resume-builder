import { NextRequest, NextResponse } from 'next/server';
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
    return NextResponse.json({ status: "Online" });
}

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) return NextResponse.json({ error: 'AI key not configured' }, { status: 500 });

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
            const buffer = Buffer.from(arrayBuffer);
            try {
                // Use standard require-style dynamic import for pdf-parse 1.1.1
                const pdf = (await import('pdf-parse')).default;
                const data = await pdf(buffer);
                text = data.text;
            } catch (err: any) {
                console.error('SERVER: PDF Extraction Failed:', err);
                return NextResponse.json({ error: 'PDF parsing error: ' + err.message }, { status: 500 });
            }
        }

        if (!text || text.trim().length < 50) {
            return NextResponse.json({ error: 'Insufficient text extracted.' }, { status: 400 });
        }

        const { createOpenAI } = await import('@ai-sdk/openai');
        const { generateText } = await import('ai');

        const ai = createOpenAI({
            baseURL: 'https://api.groq.com/openai/v1',
            apiKey: apiKey,
        });

        const { text: result } = await generateText({
            model: ai('llama-3.3-70b-versatile'),
            system: `Analyze the resume and return valid JSON { "atsScore": number, "keywordMatch": number, "impactAndMetrics": number, "feedback": string[] }. Penalize lack of metrics.`,
            prompt: `Resume Content:\n${text.substring(0, 15000)}`
        });

        let jsonStr = result.trim();
        const match = jsonStr.match(/\{[\s\S]*\}/);
        if (match) jsonStr = match[0];

        return NextResponse.json(JSON.parse(jsonStr));

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

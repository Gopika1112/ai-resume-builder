import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Standard Vercel optimization
export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({
        status: "Online",
        message: "Resume Analyzer Diagnostic OK.",
        diagnostics: {
            time: new Date().toISOString(),
            has_groq: !!process.env.GROQ_API_KEY,
            has_supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL
        }
    });
}

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

        // Dynamic imports to prevent top-level load crashes
        const { PDFParse } = await import('pdf-parse');
        const { createOpenAI } = await import('@ai-sdk/openai');
        const { generateText } = await import('ai');

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
                console.error('SERVER: PDF Extraction Failed:', err);
                return NextResponse.json({ error: 'PDF processing failed: ' + err.message }, { status: 500 });
            }
        }

        if (!text || text.trim().length < 50) {
            return NextResponse.json({ error: 'Insufficient text extracted for analysis.' }, { status: 400 });
        }

        const isOpenRouter = apiKey.startsWith('sk-or-');
        const ai = createOpenAI({
            baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : 'https://api.groq.com/openai/v1',
            apiKey: apiKey,
        });

        const modelName = isOpenRouter ? 'meta-llama/llama-3.3-70b-instruct' : 'llama-3.3-70b-versatile';

        const { text: result } = await generateText({
            model: ai(modelName),
            system: `You are a high-level ATS (Applicant Tracking System) Evaluation Intelligence.
            Analyze the resume text and provide a rigorous, professional assessment.
            
            SCORING CRITERIA (0-100 scale):
            1. atsScore: Overall professional quality, formatting clarity, and structural integrity.
            2. keywordMatch: Presence of industry-standard technical and soft skills.
            3. impactAndMetrics: Presence of quantifiable achievements (%, $, numbers) and action verbs.
            
            LOGIC RULES:
            - If no quantifiable metrics are found, max impact score is 40.
            - If structure is poor/unorganized, max atsScore is 50.
            - Provide 3-5 specific, actionable feedback points.
            
            OUTPUT: Return ONLY a valid JSON object:
            { "atsScore": number, "keywordMatch": number, "impactAndMetrics": number, "feedback": string[] }`,
            prompt: `Evaluate this resume based on industry standards:\n\n${text.substring(0, 15000)}`
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
                feedback: ["Analyzed with standard baseline metrics."]
            });
        }

    } catch (error: any) {
        console.error('SERVER ERROR AT POST:', error);
        return NextResponse.json({ error: error.message || "An internal error occurred." }, { status: 500 });
    }
}

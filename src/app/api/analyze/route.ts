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
    return NextResponse.json({ status: "Online", engine: "pdfjs-direct" });
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
            try {
                // Using pdfjs-dist directly with worker disabled for serverless stability
                const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');

                // Set workerSrc to empty to avoid module load attempts
                if (pdfjs.GlobalWorkerOptions) {
                    pdfjs.GlobalWorkerOptions.workerSrc = '';
                }

                const loadingTask = pdfjs.getDocument({
                    data: new Uint8Array(arrayBuffer),
                    disableWorker: true,
                    verbosity: 0
                } as any);

                const pdf = await loadingTask.promise;
                let fullText = "";

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    const strings = content.items.map((item: any) => item.str);
                    fullText += strings.join(" ") + "\n";
                }
                text = fullText;
            } catch (err: any) {
                console.error('SERVER: PDFJS Extraction Failed:', err);
                return NextResponse.json({ error: 'PDF parsing error: ' + err.message }, { status: 500 });
            }
        }

        if (!text || text.trim().length < 50) {
            return NextResponse.json({ error: 'Insufficient text extracted from PDF.' }, { status: 400 });
        }

        const { createOpenAI } = await import('@ai-sdk/openai');
        const { generateText } = await import('ai');

        const ai = createOpenAI({
            baseURL: 'https://api.groq.com/openai/v1',
            apiKey: apiKey,
        });

        const { text: result } = await generateText({
            model: ai('llama-3.3-70b-versatile'),
            system: `You are a high-level ATS (Applicant Tracking System) Evaluation Intelligence.
            Assess the resume rigorously with logical scoring matches on a strict 0 to 100 scale.
            
            SCORING RUBRIC (MUST BE AN INTEGER BETWEEN 0 AND 100, e.g., 85, NOT 8.5 or 8):
            1. atsScore: Overall professional quality. Score reflects structure and clarity. (0-100)
            2. keywordMatch: Professional skills and industrial terminology density. (0-100)
            3. impactAndMetrics: Presence of quantifiable achievements (%, $, numbers, user counts). (0-100)
            
            PENALTY RULES:
            - NO METRICS FOUND: If the resume lacks %, $, or numeric achievements, cap 'impactAndMetrics' at 40 and total 'atsScore' at 65.
            - POOR STRUCTURE: If text is unorganized or missing clear sections (Experience, Skills, Education), cap total 'atsScore' at 50.
            - SHORT CONTENT: If total resume text is under 300 words, cap total 'atsScore' at 60.
            
            OUTPUT: Valid JSON ONLY. Do not wrap in markdown tags or include any other text:
            { "atsScore": number, "keywordMatch": number, "impactAndMetrics": number, "feedback": ["string", "string"] }`,
            prompt: `Evaluate this resume based on executive standards. Return ONLY the JSON object.\n\n${text.substring(0, 15000)}`
        });

        let jsonStr = result.trim();
        const match = jsonStr.match(/\{[\s\S]*\}/);
        if (match) jsonStr = match[0];

        try {
            const parsed = JSON.parse(jsonStr);
            // Safeguard: Fallback for models mistakenly using a 0-10 scale
            if (parsed.atsScore > 0 && parsed.atsScore <= 10) parsed.atsScore *= 10;
            if (parsed.keywordMatch > 0 && parsed.keywordMatch <= 10) parsed.keywordMatch *= 10;
            if (parsed.impactAndMetrics > 0 && parsed.impactAndMetrics <= 10) parsed.impactAndMetrics *= 10;

            return NextResponse.json(parsed);
        } catch (e: any) {
            console.error('JSON Parse Error:', jsonStr);
            return NextResponse.json({ error: 'Failed to parse AI response.' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('FINAL POST ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

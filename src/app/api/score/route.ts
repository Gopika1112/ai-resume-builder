import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import path from 'path';
import { pathToFileURL } from 'url';
import { supabase } from '@/lib/supabase';

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

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('resume') as File | null;
        const resumeId = formData.get('resumeId') as string | null;

        let text = "";

        if (resumeId) {
            // Fetch directly from Supabase to bypass PDF extraction errors
            const { data, error } = await supabase
                .from('resumes')
                .select('content')
                .eq('id', resumeId)
                .single();

            if (error || !data) {
                return NextResponse.json({ error: 'Saved resume not found: ' + (error?.message || '') }, { status: 404 });
            }
            text = resumeToText(data.content);
            console.log('ATS_DEBUG: Scoring saved resume, text length:', text.length);
        } else if (file) {
            const arrayBuffer = await file.arrayBuffer();
            const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
            let fontPath = pathToFileURL(path.join(pdfjsDistPath, 'standard_fonts', path.sep)).href;
            let cMapPath = pathToFileURL(path.join(pdfjsDistPath, 'cmaps', path.sep)).href;
            if (!fontPath.endsWith('/')) fontPath += '/';
            if (!cMapPath.endsWith('/')) cMapPath += '/';

            const pdfParser = new PDFParse({
                data: new Uint8Array(arrayBuffer),
                standardFontDataUrl: fontPath,
                cMapUrl: cMapPath,
                cMapPacked: true
            });

            try {
                const textResult = await pdfParser.getText();
                text = textResult.text;
            } catch (err: any) {
                console.error('PDF Parse Error (Caught):', err);
                return NextResponse.json({
                    atsScore: 40,
                    keywordMatch: 0,
                    impactAndMetrics: 0,
                    feedback: [
                        "Warning: We had trouble parsing the formatting of your PDF. Building your resume directly in our tool yields the most accurate internal score.",
                        "Please ensure your PDF is not an image and contains selectable text.",
                        "Extraction fidelity issue detected: " + err.message
                    ]
                });
            }

            console.log('ATS_DEBUG: Extracted text length:', text?.length);
            if (!text || text.trim().length < 50) {
                return NextResponse.json({
                    atsScore: 0,
                    keywordMatch: 0,
                    impactAndMetrics: 0,
                    feedback: [
                        "Error: Could not extract enough readable text from this PDF.",
                        "This usually happens with browser-printed PDFs using custom fonts.",
                        "If you built this resume here, please use the 'Select Saved Resume' option for 100% accuracy."
                    ]
                });
            }
        } else {
            return NextResponse.json({ error: 'No file or resume ID provided' }, { status: 400 });
        }

        const apiKey = process.env.GROQ_API_KEY || '';
        const isOpenRouter = apiKey.startsWith('sk-or-');
        const aiProvider = createOpenAI({
            baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : 'https://api.groq.com/openai/v1',
            apiKey: apiKey,
        });
        const modelName = isOpenRouter ? 'meta-llama/llama-3.3-70b-instruct' : 'llama-3.3-70b-versatile';

        const { text: aiResponse } = await generateText({
            model: aiProvider(modelName),
            system: `You are an expert ATS evaluator. Your job is to objectively evaluate the provided resume text against Applicant Tracking System (ATS) standards.
Please be objective and detail-oriented. 
CRITICAL NOTE ON FORMATTING: If text is extracted from PDF, it may lack spaces. Look past these artifacts. 

Scoring Rubric (0-100 Base):
1. Base Score: If ANY valid resume-like words exist, start at 40. Never give a 0 unless the text is literal gibberish or empty.
2. Length & Detail (+0 to +15): Does it have substantive content and clear sections?
3. Action Verbs (+0 to +15): Does it use strong, active verbs?
4. Impact & Metrics (+0 to +20): Are there quantifiable numbers, percentages, or concrete results?
5. Keyword Optimization (+0 to +10): Does it list relevant technical or professional skills clearly?

IMPORTANT: RETURN ONLY RAW VALID JSON matching this schema:
{
  "atsScore": number, 
  "keywordMatch": number, 
  "impactAndMetrics": number, 
  "feedback": string[] 
}`,
            prompt: `Raw Resume Text:\n${text.substring(0, 15000)}`
        });

        let result = {
            atsScore: 40,
            keywordMatch: 0,
            impactAndMetrics: 0,
            feedback: [] as string[]
        };

        try {
            const match = aiResponse.match(/\{[\s\S]*\}/);
            if (!match) throw new Error("No JSON object found");
            const parsed = JSON.parse(match[0]);

            const mappedScore = Number(parsed.atsScore ?? parsed.ats_score ?? parsed.score ?? 40);
            const mappedKeywords = Number(parsed.keywordMatch ?? parsed.keywords ?? parsed.keyword_match ?? 0);
            const mappedImpact = Number(parsed.impactAndMetrics ?? parsed.impact ?? parsed.impact_and_metrics ?? 0);

            result.atsScore = isNaN(mappedScore) ? 40 : Math.max(40, Math.min(100, mappedScore));
            result.keywordMatch = isNaN(mappedKeywords) ? 0 : Math.max(0, Math.min(100, mappedKeywords));
            result.impactAndMetrics = isNaN(mappedImpact) ? 0 : Math.max(0, Math.min(100, mappedImpact));
            result.feedback = Array.isArray(parsed.feedback) && parsed.feedback.length > 0 ? parsed.feedback : [
                "Include more quantifiable metrics.",
                "Action verbs can strengthen your bullet points.",
                "Ensure skills are clearly highlighted."
            ];

            if (mappedScore < 10 && !resumeId) {
                result.feedback.unshift("Warning: We had trouble parsing the formatting of your PDF. Using the built-in 'Select Saved Resume' option provides 100% accurate results.");
            }
        } catch (e) {
            console.error('ATS_API: Failed to parse AI output:', aiResponse);
            result.feedback = ["Warning: System processing error. Please try selecting your resume from the 'Saved' list."];
        }

        console.log('ATS_DEBUG: Finalized Result:', JSON.stringify(result, null, 2));
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Score Generation Error:', error);
        return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
    }
}

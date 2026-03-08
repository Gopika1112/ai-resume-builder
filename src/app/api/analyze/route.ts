import { NextResponse, NextRequest } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import path from 'path';
import { pathToFileURL } from 'url';
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

export async function POST(req: Request) {
    const timestamp = new Date().toISOString();
    console.log(`ATS_API [${timestamp}]: Received score request in ${process.cwd()}`);
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error('ATS_API: GROQ_API_KEY is missing');
            return NextResponse.json({ error: 'AI Service configuration missing (GROQ_API_KEY).' }, { status: 500 });
        }

        const formData = await req.formData();
        const file = formData.get('resume') as File | null;
        const resumeId = formData.get('resumeId') as string | null;

        let text = "";

        if (resumeId) {
            console.log('ATS_API: Scoring saved resume ID:', resumeId);
            const { data, error } = await supabase
                .from('resumes')
                .select('content')
                .eq('id', resumeId)
                .single();

            if (error || !data) {
                return NextResponse.json({ error: 'Saved resume not found: ' + (error?.message || '') }, { status: 404 });
            }
            text = resumeToText(data.content);
        } else if (file) {
            console.log('ATS_API: Scoring uploaded file:', file.name, 'size:', file.size);
            const arrayBuffer = await file.arrayBuffer();

            try {
                // More robust PDF parsing initialization
                let fontPath = undefined;
                let cMapPath = undefined;

                try {
                    const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
                    fontPath = pathToFileURL(path.join(pdfjsDistPath, 'standard_fonts', path.sep)).href;
                    cMapPath = pathToFileURL(path.join(pdfjsDistPath, 'cmaps', path.sep)).href;
                    if (!fontPath.endsWith('/')) fontPath += '/';
                    if (!cMapPath.endsWith('/')) cMapPath += '/';
                } catch (resolveError) {
                    console.warn('ATS_API: Could not resolve pdfjs-dist paths, falling back to defaults:', resolveError);
                }

                const pdfParser = new PDFParse({
                    data: new Uint8Array(arrayBuffer),
                    standardFontDataUrl: fontPath,
                    cMapUrl: cMapPath,
                    cMapPacked: true
                });

                const textResult = await pdfParser.getText();
                text = textResult.text;
                console.log('ATS_API: Successfully extracted text, length:', text?.length);
            } catch (err: any) {
                console.error('ATS_API: PDF Parse Error:', err);
                return NextResponse.json({
                    atsScore: 40,
                    keywordMatch: 0,
                    impactAndMetrics: 0,
                    feedback: [
                        "Warning: We had trouble parsing your PDF file.",
                        "Error detail: " + (err.message || 'Check if the PDF is text-based and not scanned.'),
                        "For best results, build your resume directly in our tool."
                    ]
                });
            }

            if (!text || text.trim().length < 50) {
                return NextResponse.json({
                    atsScore: 0,
                    keywordMatch: 0,
                    impactAndMetrics: 0,
                    feedback: [
                        "Error: Could not extract enough readable text from this PDF.",
                        "The file might be an image/scan or uses unsupported fonts.",
                        "Try building your resume here for 100% accuracy."
                    ]
                });
            }
        } else {
            return NextResponse.json({ error: 'No file or resume ID provided' }, { status: 400 });
        }

        const isOpenRouter = apiKey.startsWith('sk-or-');
        const aiProvider = createOpenAI({
            baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : 'https://api.groq.com/openai/v1',
            apiKey: apiKey,
        });
        const modelName = isOpenRouter ? 'meta-llama/llama-3.3-70b-instruct' : 'llama-3.3-70b-versatile';

        console.log('ATS_API: Sending to AI model:', modelName);
        const { text: aiResponse } = await generateText({
            model: aiProvider(modelName),
            system: `You are an expert ATS evaluator and senior technical recruiter. Your job is to objectively evaluate the provided resume text against Applicant Tracking System (ATS) standards.

CRITICAL INSTRUCTIONS:
1. FORMATTING: Text extracted from PDFs may lack spaces or have odd line breaks. Look past these artifacts to find the meaning.
2. SCALING: All numeric scores (atsScore, keywordMatch, impactAndMetrics) MUST be integers between 0 and 100. DO NOT use decimals (e.g., return 85, not 0.85).
3. SCORING RUBRIC (Base 100):
   - Base Score (+40): If it looks like a resume, start at 40.
   - Detail & Quality (+0 to +20): Professional summary, clear sections, and depth of content.
   - Keyword Optimization (+0 to +10): Technical/soft skills relevant to the industry.
   - Action Verbs (+0 to +10): Use of "Managed", "Developed", "Led", etc.
   - Impact & Metrics (+0 to +20): QUANTIFIABLE metrics (%, $, numbers, growth, time saved).

RETURN ONLY RAW VALID JSON matching this schema:
{
  "atsScore": number, 
  "keywordMatch": number, 
  "impactAndMetrics": number, 
  "feedback": string[] 
}`,
            prompt: `Raw Resume Text to Evaluate:\n${text.substring(0, 15000)}`
        });

        // Enhanced cleaning of AI response
        let cleanAiResponse = aiResponse.trim();
        // Remove markdown code blocks if present
        if (cleanAiResponse.includes('```')) {
            const match = cleanAiResponse.match(/\{[\s\S]*\}/);
            if (match) {
                cleanAiResponse = match[0];
            }
        }

        let result = {
            atsScore: 40,
            keywordMatch: 0,
            impactAndMetrics: 0,
            feedback: [] as string[]
        };

        try {
            const parsed = JSON.parse(cleanAiResponse);

            let rawScore = parsed.atsScore ?? parsed.ats_score ?? parsed.score ?? parsed.totalScore ?? 40;
            let rawKeywords = parsed.keywordMatch ?? parsed.keywords ?? parsed.keyword_match ?? 0;
            let rawImpact = parsed.impactAndMetrics ?? parsed.impact ?? parsed.impact_and_metrics ?? 0;

            let mappedScore = Number(rawScore);
            let mappedKeywords = Number(rawKeywords);
            let mappedImpact = Number(rawImpact);

            // Rescale if return values are decimals (0-1)
            if (mappedScore > 0 && mappedScore <= 1) mappedScore *= 100;
            if (mappedKeywords > 0 && mappedKeywords <= 1) mappedKeywords *= 100;
            if (mappedImpact > 0 && mappedImpact <= 1) mappedImpact *= 100;

            result.atsScore = isNaN(mappedScore) ? 40 : Math.max(0, Math.min(100, Math.round(mappedScore)));
            result.keywordMatch = isNaN(mappedKeywords) ? 0 : Math.max(0, Math.min(100, Math.round(mappedKeywords)));
            result.impactAndMetrics = isNaN(mappedImpact) ? 0 : Math.max(0, Math.min(100, Math.round(mappedImpact)));

            result.feedback = Array.isArray(parsed.feedback) && parsed.feedback.length > 0 ? parsed.feedback : [
                "Ensure your resume uses quantifiable metrics (%, $, numbers).",
                "Use strong action verbs to start your bullet points.",
                "Align your skills section with specific industry keywords."
            ];
        } catch (e) {
            console.error('ATS_API: Failed to parse AI output:', aiResponse);
            result.feedback = ["Warning: The AI analysis returned a malformed response. Using estimated scores."];
            // Try one last-ditch effort to find JSON in the mess
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const secondTry = JSON.parse(jsonMatch[0]);
                    result.atsScore = Number(secondTry.atsScore || 40);
                    result.feedback = secondTry.feedback || result.feedback;
                } catch (e2) { }
            }
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('ATS_API: Fatal Error:', error);
        return NextResponse.json({
            error: 'Server error during analysis: ' + (error.message || 'Unknown error'),
            details: error.stack?.substring(0, 200)
        }, { status: 500 });
    }
}

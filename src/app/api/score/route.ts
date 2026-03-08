import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import path from 'path';
import { pathToFileURL } from 'url';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('resume') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();

        // Use standard fonts and cmaps for better extraction of non-embedded fonts in browser-printed PDFs
        const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));

        // Use file:// URLs for absolute paths on Windows to satisfy pdfjs-dist requirements
        let fontPath = pathToFileURL(path.join(pdfjsDistPath, 'standard_fonts', path.sep)).href;
        let cMapPath = pathToFileURL(path.join(pdfjsDistPath, 'cmaps', path.sep)).href;

        // Ensure trailing slash for pdfjs-dist factory URL requirement
        if (!fontPath.endsWith('/')) fontPath += '/';
        if (!cMapPath.endsWith('/')) cMapPath += '/';

        const pdfParser = new PDFParse({
            data: new Uint8Array(arrayBuffer),
            standardFontDataUrl: fontPath,
            cMapUrl: cMapPath,
            cMapPacked: true
        });
        let textResult;
        try {
            textResult = await pdfParser.getText();
        } catch (err: any) {
            console.error('PDF Parse Error (Caught):', err);
            // Fallback to baseline 40 instead of erroring out
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

        const text = textResult.text;
        console.log('ATS_DEBUG: Extracted text length:', text?.length);
        if (text && text.length > 50) {
            console.log('ATS_DEBUG: First 100 chars:', text.substring(0, 100));
        }

        if (!text || text.trim().length < 50) {
            return NextResponse.json({
                atsScore: 0,
                keywordMatch: 0,
                impactAndMetrics: 0,
                feedback: [
                    "Error: Could not extract enough readable text from this PDF.",
                    "This usually happens with browser-printed PDFs using custom fonts.",
                    "Please try saving the resume as a standard text-based PDF or using a different PDF printer."
                ]
            });
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
CRITICAL NOTE ON FORMATTING: The text you are evaluating is extracted from a PDF. It may COMPLETELY LACK SPACES between words, have random newlines, or be heavily garbled (e.g., "S o f t w a r eE n g i n e e r"). YOU MUST look past these extraction artifacts. Do your absolute best to read the text as words. DO NOT penalize the resume for formatting, missing spaces, or garbled characters.

Scoring Rubric (0-100 Base):
1. Base Score: If ANY valid resume-like words exist, start at 40. Never give a 0 unless the text is literal gibberish or empty.
2. Length & Detail (+0 to +15): Does it have substantive content and clear sections?
3. Action Verbs (+0 to +15): Does it use strong, active verbs?
4. Impact & Metrics (+0 to +20): Are there quantifiable numbers, percentages, or concrete results?
5. Keyword Optimization (+0 to +10): Does it list relevant technical or professional skills clearly?

IMPORTANT: YOU MUST RETURN ONLY RAW VALID JSON. Return a JSON object matching exactly this schema:
{
  "atsScore": number, 
  "keywordMatch": number, 
  "impactAndMetrics": number, 
  "feedback": string[] 
}`,
            prompt: `Raw Resume Text:\n${text.substring(0, 15000)}`
        });

        let cleanJson = aiResponse.trim();
        let result = {
            atsScore: 40,
            keywordMatch: 0,
            impactAndMetrics: 0,
            feedback: [] as string[]
        };

        try {
            const match = cleanJson.match(/\{[\s\S]*\}/);
            if (!match) throw new Error("No JSON object found in LLM response");

            const parsed = JSON.parse(match[0]);

            // Robust key mapping to catch variations from the AI
            const mappedScore = Number(parsed.atsScore ?? parsed.ats_score ?? parsed.score ?? 40);
            const mappedKeywords = Number(parsed.keywordMatch ?? parsed.keywords ?? parsed.keyword_match ?? 0);
            const mappedImpact = Number(parsed.impactAndMetrics ?? parsed.impact ?? parsed.impact_and_metrics ?? 0);

            result.atsScore = isNaN(mappedScore) ? 40 : Math.max(40, Math.min(100, mappedScore));
            result.keywordMatch = isNaN(mappedKeywords) ? 0 : Math.max(0, Math.min(100, mappedKeywords));
            result.impactAndMetrics = isNaN(mappedImpact) ? 0 : Math.max(0, Math.min(100, mappedImpact));

            result.feedback = Array.isArray(parsed.feedback) && parsed.feedback.length > 0
                ? parsed.feedback
                : [
                    "Ensure your PDF text is fully selectable and not rasterized as an image.",
                    "Include more quantifiable metrics to improve your score.",
                    "Action verbs can greatly strengthen your experience bullet points."
                ];

            // Add warning if the base score had to be forced
            if (mappedScore < 10) {
                result.feedback.unshift("Warning: We had trouble parsing the formatting of your PDF, which affected your score. Building your resume directly in our tool yields the most accurate internal score.");
            }

        } catch (e: any) {
            console.error('ATS_API: Failed to parse AI output:', aiResponse);
            // Result already has defaults, so we just return the default 40
            result.feedback = ["Warning: System processing error. Please ensure your PDF contains selectable text."];
        }

        console.log('ATS_DEBUG: Finalized Result:', JSON.stringify(result, null, 2));

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Score Generation Error:', error);
        return NextResponse.json(
            { error: error.message || 'Unknown error while processing file.' },
            { status: 500 }
        );
    }
}

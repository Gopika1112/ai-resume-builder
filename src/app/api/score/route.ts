import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('resume') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();

        // Use standard fonts for better extraction of non-embedded fonts in browser-printed PDFs
        const pdfParser = new PDFParse({
            data: new Uint8Array(arrayBuffer),
            standardFontDataUrl: 'c:/Users/gopik/OneDrive/Desktop/antigravity/node_modules/pdfjs-dist/standard_fonts/'
        });
        let textResult;
        try {
            textResult = await pdfParser.getText();
        } catch (err: any) {
            console.error('PDF Parse Error:', err);
            return NextResponse.json({ error: 'Failed to extract text from PDF: ' + err.message }, { status: 400 });
        }

        const text = textResult.text;

        if (!text || text.trim().length < 50) {
            return NextResponse.json({
                atsScore: 0,
                keywordMatch: 0,
                impactAndMetrics: 0,
                feedback: [
                    "Error: Could not extract enough readable text from this PDF.",
                    "This usually happens with browser-printed PDFs using custom fonts.",
                    "Please try saving the resume as a standard text-based PDF or using a different PDF printer.",
                    "If you built this using our builder, the internal ATS score is more accurate."
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

IMPORTANT: YOU MUST RETURN ONLY RAW VALID JSON. DO NOT WRAP WITH MARKDOWN BLOCKS LIKE \`\`\`json. Return a JSON object matching exactly this schema:
{
  "atsScore": number, // Calculate based on the rubric. Max 100.
  "keywordMatch": number, // 0-100 percentage.
  "impactAndMetrics": number, // 0-100 percentage.
  "feedback": string[] // 3-4 actionable points.
}`,
            prompt: `Raw Resume Text:\n${text.substring(0, 15000)}`
        });

        let cleanJson = aiResponse.trim();
        let result;
        try {
            const match = cleanJson.match(/\{[\s\S]*\}/);
            if (!match) throw new Error("No JSON object found in LLM response");

            result = JSON.parse(match[0]);

            // Ensure scores are actual numbers and fallback safely
            // AI sometimes uses "ats_score" or other variations. We'll be flexible.
            const rawScore = Number(result.atsScore ?? result.ats_score ?? result.score);
            const rawKeywords = Number(result.keywordMatch ?? result.keywords ?? result.keyword_match);
            const rawImpact = Number(result.impactAndMetrics ?? result.impact ?? result.impact_and_metrics);

            // Ensure feedback is never empty
            if (!Array.isArray(result.feedback) || result.feedback.length === 0) {
                result.feedback = [
                    "Ensure your PDF text is fully selectable and not rasterized as an image.",
                    "Include more quantifiable metrics to improve your score.",
                    "Action verbs can greatly strengthen your experience bullet points."
                ];
            }

            // Apply safety fallback if score is zero or invalid
            if (isNaN(rawScore) || rawScore < 10) {
                result.atsScore = 40;
                result.feedback.unshift("Warning: We had trouble parsing the formatting of your PDF, which affected your score. Building your resume directly in our tool yields the most accurate internal score.");
            } else {
                result.atsScore = Math.min(100, rawScore);
            }

            result.keywordMatch = isNaN(rawKeywords) ? 0 : Math.max(0, Math.min(100, rawKeywords));
            result.impactAndMetrics = isNaN(rawImpact) ? 0 : Math.max(0, Math.min(100, rawImpact));

        } catch (e: any) {
            console.error('ATS_API: Failed to parse AI output:', aiResponse);
            throw new Error('AI returned invalid JSON formatting: ' + e.message);
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Score Generation Error:', error);
        return NextResponse.json(
            { error: error.message || 'Unknown error while processing file.' },
            { status: 500 }
        );
    }
}

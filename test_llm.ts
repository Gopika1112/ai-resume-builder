import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GROQ_API_KEY || '';
const aiProvider = createOpenAI({
    baseURL: apiKey.startsWith('sk-or-') ? 'https://openrouter.ai/api/v1' : 'https://api.groq.com/openai/v1',
    apiKey
});

async function test() {
    const text = 'test resume text for developer with 5 years experience programming in python. Increased sales by 50%';
    const { text: aiResponse } = await generateText({
        model: aiProvider(apiKey.startsWith('sk-or-') ? 'meta-llama/llama-3.3-70b-instruct' : 'llama-3.3-70b-versatile'),
        system: `You are an expert ATS evaluator. Your job is to objectively evaluate the provided resume text against Applicant Tracking System (ATS) standards.
Please be objective and detail-oriented. 
Note: The text is extracted from a PDF and may have lost some spaces between words or original formatting. Do your best to interpret the raw text fairly without penalizing for extraction artifacts.

Scoring Rubric (0-100 Base):
1. Base Score: Start at 40 for a standard complete resume.
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
        prompt: `Raw Resume Text:\n${text}`
    });
    console.log("Response:", aiResponse);
}

test().catch(console.error);

import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Dynamically detect if the user provided an OpenRouter key or a Groq key
        const apiKey = process.env.GROQ_API_KEY || '';
        const isOpenRouter = apiKey.startsWith('sk-or-');

        const aiProvider = createOpenAI({
            baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : 'https://api.groq.com/openai/v1',
            apiKey: apiKey,
        });

        const modelName = isOpenRouter ? 'meta-llama/llama-3.3-70b-instruct' : 'llama-3.3-70b-versatile';

        const { text } = await generateText({
            model: aiProvider(modelName),
            system: `You are an expert executive resume writer, career coach, and senior technical recruiter. Your job is to:
      1. Take raw, unpolished user data and transform it into a highly professional, ATS-optimized resume. 
      2. Rewrite the summary to be compelling, concise, and impactful.
      3. Rewrite experience descriptions using strong action verbs, and emphasize achievements and quantifiable metrics where appropriate. Break raw descriptions into 3-5 sharp, impactful bullet points.
      4. Evaluate the provided resume data against Applicant Tracking System (ATS) standards.
      5. Provide an overall ATS score out of 100 based on keyword optimization, quantifiable metrics, and impact.
      6. Provide 2-3 specific points of actionable feedback on how the generated resume could be further improved by the user adding more specifics (e.g. "Add more numeric metrics to your first role").
      
      IMPORTANT: YOU MUST RETURN ONLY RAW VALID JSON. DO NOT WRAP WITH MARKDOWN BLOCKS LIKE \`\`\`json. ONLY RAW JSON MATCHING THE EXACT SCHEMA PROVIDED IN THE PROMPT.`,
            prompt: `Please process, optimize, and evaluate the following candidate data and match this exact JSON interface:
      {
         "personalInfo": { "fullName": "string", "email": "string", "phone": "string", "location": "string", "linkedin": "string", "github": "string", "portfolio": "string" },
         "summary": "string",
         "experience": [ { "jobTitle": "string", "company": "string", "startDate": "string", "endDate": "string", "bullets": ["string", "string", "string"] } ],
         "education": [ { "degree": "string", "institution": "string", "completionYear": "string" } ],
         "skills": ["string", "string"],
         "atsScore": 85,
         "atsFeedback": ["string", "string"],
         "template": "string"
      }
      
      Raw User Data:
      ${JSON.stringify(data, null, 2)}
      `,
        });

        // Clean any potential markdown wrappers Groq might still send and parse
        let cleanJson = text.trim();
        if (cleanJson.startsWith('\`\`\`json')) {
            cleanJson = cleanJson.replace(/^\`\`\`json/, '');
        }
        if (cleanJson.startsWith('\`\`\`')) {
            cleanJson = cleanJson.replace(/^\`\`\`/, '');
        }
        if (cleanJson.endsWith('\`\`\`')) {
            cleanJson = cleanJson.replace(/\`\`\`$/, '');
        }

        let generatedResume;
        try {
            generatedResume = JSON.parse(cleanJson.trim());
        } catch (e) {
            console.error('Failed to parse Groq output:', cleanJson);
            throw new Error('AI returned invalid formatting. Please try again.');
        }

        // Ensure the template state from the payload is carried over in case the AI missed it or the payload didn't explicitly map it correctly in the prompt
        if (data.template && !generatedResume.template) {
            generatedResume.template = data.template;
        } else if (data.template) {
            generatedResume.template = data.template; // Force pass-through
        }

        // Save to Supabase
        const { data: insertedData, error } = await supabase
            .from('resumes')
            .insert({ content: generatedResume })
            .select('id')
            .single();

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error('Failed to save resume variables to database: ' + error.message);
        }

        return NextResponse.json({ id: insertedData.id });
    } catch (error) {
        console.error('Generation Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown generation error.' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({
        message: "GET analysis - OK. Route is reachable.",
        has_groq_key: !!process.env.GROQ_API_KEY,
        has_supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL
    });
}

export async function POST(req: Request) {
    // Dynamic import to avoid route-load crash if dependency is broken
    try {
        const { PDFParse } = await import('pdf-parse');
        const { createOpenAI } = await import('@ai-sdk/openai');
        const { generateText } = await import('ai');
        const { supabase } = await import('@/lib/supabase');

        const formData = await req.formData();
        const resumeId = formData.get('resumeId');

        return NextResponse.json({
            message: "POST analysis - OK. Received data.",
            echo: resumeId
        });
    } catch (e: any) {
        return NextResponse.json({ error: "Dependency load failed: " + e.message }, { status: 500 });
    }
}

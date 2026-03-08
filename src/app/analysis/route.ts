import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({
        message: "Analysis route is reachable.",
        has_groq_key: !!process.env.GROQ_API_KEY,
        has_supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL
    });
}

export async function POST(req: Request) {
    return NextResponse.json({
        message: "POST to analysis route is reachable."
    });
}

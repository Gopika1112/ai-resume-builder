import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: any) {
    return NextResponse.json({ message: "POST success (diagnostic)" });
}

export async function GET() {
    return NextResponse.json({
        message: "GET success (diagnostic)",
        env_keys: Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('GROQ')),
        node_version: process.version
    });
}

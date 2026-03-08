import { NextResponse, NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const rid = formData.get('resumeId');
        return NextResponse.json({
            success: true,
            echo: rid,
            message: "Route is active and accepting POST requests."
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: "GET request received. API is active." });
}

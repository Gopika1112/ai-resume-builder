import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({ message: "Analysis engine is live (minimal)." });
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const rid = formData.get('resumeId');
        return NextResponse.json({
            atsScore: 85,
            keywordMatch: 70,
            impactAndMetrics: 70,
            feedback: ["Endpoint test successful.", "System is reachable."],
            echo: rid
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase/server";
import { streamChat } from "@/lib/gemini";
import { createTextStream } from "@/lib/chat/create-text-stream";

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { documentId, message, history, context } = await req.json();

    if (!documentId || !message) {
        return new NextResponse("Missing required fields", { status: 400 });
    }

    const stream = createTextStream(
        signal => streamChat(history || [], message, context, signal),
        req.signal,
    );

    return new Response(stream, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
        },
    });
}

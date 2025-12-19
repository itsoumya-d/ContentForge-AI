import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase/server";
import { streamChat } from "@/lib/gemini";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { documentId, chatId, message, history, context } = await req.json();

    if (!documentId || !message) {
        return new NextResponse("Missing required fields", { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            try {
                const gen = streamChat(history || [], message, context);
                let fullResponse = "";

                for await (const chunk of gen) {
                    fullResponse += chunk;
                    controller.enqueue(encoder.encode(chunk));
                }

                controller.close();
            } catch (error) {
                console.error("Chat route error:", error);
                controller.error(error);
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Transfer-Encoding": "chunked",
        },
    });
}

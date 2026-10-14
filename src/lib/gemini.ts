import { GoogleGenerativeAI, Content, Part, type GenerativeModel } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

export { model };

export async function analyzeDocument(content: string, type: string): Promise<{ summary: string; tags: string[] }> {
    if (!model) throw new Error("Gemini API not configured");
    if (!content.trim()) throw new Error("Document content is empty");

    const prompt = `Analyze the following document content (Type: ${type}).
Provide a concise summary (max 3 sentences) and extract 3-5 key topics/tags.
Return a JSON object with "summary" and "tags" keys.`;
    // Provider failures must reject, not become a successful summary.
    const result = await model.generateContent([prompt, content]);
    const text = result.response.text().trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const analysis: unknown = JSON.parse(text);
    if (!analysis || typeof analysis !== "object" || !("summary" in analysis) || !("tags" in analysis)
        || typeof analysis.summary !== "string" || !analysis.summary.trim()
        || !Array.isArray(analysis.tags) || !analysis.tags.every((tag: unknown) => typeof tag === "string" && tag.trim())) {
        throw new Error("Invalid document analysis response");
    }
    return { summary: analysis.summary.trim(), tags: analysis.tags.map((tag: string) => tag.trim()) };
}

export async function* streamChat(history: Content[], message: string, context?: string, signal?: AbortSignal) {
    if (!model) {
        throw new Error("Gemini API not configured");
    }

    const chat = model.startChat({
        history,
        generationConfig: {
            maxOutputTokens: 2048,
        },
    });

    const prompt = context
        ? `Context from document: ${context}\n\nUser Question: ${message}`
        : message;

    signal?.throwIfAborted();
    const result = await chat.sendMessageStream(prompt, { signal });
    for await (const chunk of result.stream) {
        signal?.throwIfAborted();
        yield chunk.text();
    }
}

export async function getMultimodalParts(fileUrl: string, mimeType: string): Promise<Part[]> {
    try {
        const response = await fetch(fileUrl);
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");

        return [
            {
                inlineData: {
                    data: base64,
                    mimeType: mimeType,
                },
            },
        ];
    } catch (error) {
        console.error("Multimodal conversion error:", error);
        return [];
    }
}

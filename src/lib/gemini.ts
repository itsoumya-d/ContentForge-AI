import { GoogleGenerativeAI, Content, Part } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

export { model };

export async function analyzeDocument(content: string, type: string) {
    if (!model) {
        console.warn("Gemini API key missing, skipping analysis");
        return {
            summary: "Analysis skipped (API key missing).",
            tags: [],
        };
    }

    const prompt = `
    Analyze the following document content (Type: ${type}).
    Provide a concise summary (max 3 sentences) and extract 3-5 key topics/tags.
    Return the response as a JSON object with "summary" and "tags" keys.
  `;

    try {
        const result = await model.generateContent([prompt, content]);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return {
            summary: text,
            tags: [],
        };
    } catch (error) {
        console.error("Gemini analysis error:", error);
        return {
            summary: "Failed to analyze document.",
            tags: [],
        };
    }
}

export async function* streamChat(history: Content[], message: string, context?: string) {
    if (!model) {
        yield "Error: Gemini API not configured.";
        return;
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

    try {
        const result = await chat.sendMessageStream(prompt);
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            yield chunkText;
        }
    } catch (error) {
        console.error("Gemini streaming error:", error);
        yield "Error: Failed to get response from Gemini.";
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

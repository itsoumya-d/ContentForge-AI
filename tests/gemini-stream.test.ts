import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sendMessageStream } = vi.hoisted(() => ({ sendMessageStream: vi.fn() }));
vi.mock("@google/generative-ai", () => ({
    GoogleGenerativeAI: class {
        getGenerativeModel() { return { startChat: () => ({ sendMessageStream }) }; }
    },
}));
const collect = async (source: AsyncIterable<string>) => {
    const chunks = [];
    for await (const chunk of source) chunks.push(chunk);
    return chunks;
};
beforeEach(() => { vi.resetModules(); vi.stubEnv("GEMINI_API_KEY", "test-only-placeholder"); sendMessageStream.mockReset(); });
afterEach(() => { vi.unstubAllEnvs(); });

describe("streamChat provider boundary", () => {
    it("passes cancellation to the SDK and yields only model text", async () => {
        sendMessageStream.mockResolvedValue({ stream: (async function* () { yield { text: () => "answer" }; })() });
        const { streamChat } = await import("@/lib/gemini");
        const signal = new AbortController().signal;
        expect(await collect(streamChat([], "question", undefined, signal))).toEqual(["answer"]);
        expect(sendMessageStream).toHaveBeenCalledWith("question", { signal });
    });

    it("rejects a provider failure instead of yielding an error as an answer", async () => {
        sendMessageStream.mockRejectedValue(new Error("provider unavailable"));
        const { streamChat } = await import("@/lib/gemini");
        await expect(collect(streamChat([], "question"))).rejects.toThrow("provider unavailable");
    });

    it("rejects missing configuration without making a provider request", async () => {
        vi.stubEnv("GEMINI_API_KEY", "");
        const { streamChat } = await import("@/lib/gemini");
        await expect(collect(streamChat([], "question"))).rejects.toThrow("not configured");
        expect(sendMessageStream).not.toHaveBeenCalled();
    });

    it("stops before sending a request when already cancelled", async () => {
        const controller = new AbortController(); controller.abort();
        const { streamChat } = await import("@/lib/gemini");
        await expect(collect(streamChat([], "question", undefined, controller.signal))).rejects.toMatchObject({ name: "AbortError" });
        expect(sendMessageStream).not.toHaveBeenCalled();
    });
});

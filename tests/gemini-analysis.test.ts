import { afterEach, beforeEach, expect, it, vi } from "vitest";
const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));
vi.mock("@google/generative-ai", () => ({ GoogleGenerativeAI: class { getGenerativeModel() { return { generateContent }; } } }));
beforeEach(() => { vi.resetModules(); vi.stubEnv("GEMINI_API_KEY", "test-only-placeholder"); generateContent.mockReset(); });
afterEach(() => vi.unstubAllEnvs());
it("fails explicitly when not configured", async () => {
 vi.stubEnv("GEMINI_API_KEY", ""); const {analyzeDocument} = await import("@/lib/gemini"); await expect(analyzeDocument("actual text", "text/plain")).rejects.toThrow(); expect(generateContent).not.toHaveBeenCalled();
});
it("does not turn provider errors into successful analysis", async () => {
 generateContent.mockRejectedValue(new Error("provider failure")); const {analyzeDocument} = await import("@/lib/gemini"); await expect(analyzeDocument("actual text", "text/plain")).rejects.toThrow();
});
it.each(['', 'not json', '{}', 'null', '{"summary":"","tags":[]}', '{"summary":"valid","tags":[42]}'])("rejects malformed analysis %s", async text => {
 generateContent.mockResolvedValue({response: {text: () => text}}); const {analyzeDocument} = await import("@/lib/gemini"); await expect(analyzeDocument("actual text", "text/plain")).rejects.toThrow();
});
it("validates and trims successful analysis", async () => {
 generateContent.mockResolvedValue({response: {text: () => '```json\n{"summary":" Valid summary ","tags":[" topic "]}\n```'}}); const {analyzeDocument} = await import("@/lib/gemini"); expect(await analyzeDocument("actual text", "text/plain")).toEqual({summary: "Valid summary", tags: ["topic"]});
});
it("does not send empty content", async () => {
 const {analyzeDocument} = await import("@/lib/gemini"); await expect(analyzeDocument("   ", "text/plain")).rejects.toThrow(); expect(generateContent).not.toHaveBeenCalled();
});

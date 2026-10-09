import { beforeEach, describe, expect, it, vi } from "vitest";
const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));
vi.mock("@/lib/gemini", () => ({ model: { generateContent } }));
import { generateSocialContent } from "@/lib/actions/transform";
const twitterOnly = { twitter: true, linkedin: false, instagram: false };
beforeEach(() => { generateContent.mockReset(); });

describe("synthetic transform audit", () => {
    it("reports provider rejection instead of returning generated failure text", async () => {
        generateContent.mockRejectedValue(new Error("synthetic provider unavailable"));
        const result = await generateSocialContent("Synthetic source", twitterOnly, "Professional");
        expect(result.twitter).toBeUndefined();
        expect(result.error).toBeTruthy();
    });
    it("rejects valid JSON with an invalid Twitter thread shape", async () => {
        generateContent.mockResolvedValue({ response: { text: () => '{"message":"not an array"}' } });
        const result = await generateSocialContent("Synthetic source", twitterOnly, "Professional");
        expect(result.twitter).toBeUndefined();
        expect(result.error).toBeTruthy();
    });
    it("rejects empty output instead of reporting success", async () => {
        generateContent.mockResolvedValue({ response: { text: () => "   " } });
        const result = await generateSocialContent("Synthetic source", {twitter: false, linkedin: true, instagram: false}, "Professional");
        expect(result.linkedin).toBeUndefined();
        expect(result.error).toBeTruthy();
    });
    it("preserves a valid successful thread", async () => {
        generateContent.mockResolvedValue({ response: { text: () => '["Synthetic first post", "Synthetic second post"]' } });
        const result = await generateSocialContent("Synthetic source", twitterOnly, "Professional");
        expect(result.twitter).toEqual(["Synthetic first post", "Synthetic second post"]);
        expect(result.error).toBeUndefined();
    });
});

it.each(['not json', '{}', 'null', '1', '"text"', '[]', '[42]', '["ok", null]', '["ok", "   "]'])("rejects invalid thread %s", async text => {
    generateContent.mockResolvedValue({ response: { text: () => text } });
    const result = await generateSocialContent("Synthetic source", twitterOnly, "Professional");
    expect(result.twitter).toBeUndefined();
    expect(result.errors?.twitter).toBeTruthy();
    expect(result.error).toBeTruthy();
});
it("retains valid platforms when another provider request fails", async () => {
    generateContent.mockResolvedValueOnce({ response: { text: () => '["valid post"]' } });
    generateContent.mockRejectedValueOnce(new Error("private diagnostic"));
    generateContent.mockResolvedValueOnce({ response: { text: () => '  valid caption  ' } });
    const result = await generateSocialContent("Synthetic source", {twitter: true, linkedin: true, instagram: true}, "Professional");
    expect(result).toEqual({twitter: ["valid post"], instagram: "valid caption", errors: {linkedin: "Could not generate valid content. Please try again."}});
    expect(JSON.stringify(result)).not.toContain("private diagnostic");
});
it("accepts a fenced valid thread", async () => {
    generateContent.mockResolvedValue({ response: { text: () => '```json\n[" valid post "]\n```' } });
    expect((await generateSocialContent("Synthetic source", twitterOnly, "Professional")).twitter).toEqual(["valid post"]);
});
it.each(["linkedin", "instagram"] as const)("rejects blank %s output", async platform => {
    generateContent.mockResolvedValue({ response: { text: () => '\n  ' } });
    const result = await generateSocialContent("Synthetic source", {twitter: false, linkedin: platform === "linkedin", instagram: platform === "instagram"}, "Professional");
    expect(result[platform]).toBeUndefined();
    expect(result.errors?.[platform]).toBeTruthy();
});
it("does not call the model for empty input or no platforms", async () => {
    expect((await generateSocialContent("  ", twitterOnly, "Professional")).error).toBeTruthy();
    expect((await generateSocialContent("Synthetic source", {twitter: false, linkedin: false, instagram: false}, "Professional")).error).toBeTruthy();
    expect(generateContent).not.toHaveBeenCalled();
});

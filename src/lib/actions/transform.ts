"use server";

import { model } from "@/lib/gemini";
import { PROMPTS } from "@/lib/ai/prompts";

export type TransformPlatform = "twitter" | "linkedin" | "instagram";

export interface TransformResult {
    twitter?: string[];
    linkedin?: string;
    instagram?: string;
    errors?: Partial<Record<TransformPlatform, string>>;
    error?: string;
}

export async function generateSocialContent(
    content: string,
    platforms: Record<TransformPlatform, boolean>,
    tone: string
): Promise<TransformResult> {
    if (!content.trim()) return { error: "Please enter some content to transform." };
    const selected = (["twitter", "linkedin", "instagram"] as const).filter(platform => platforms[platform]);
    if (!selected.length) return { error: "Please select at least one platform." };
    if (!model) return { error: "AI model not configured" };

    const configuredModel = model;
    const result: TransformResult = {};
    const errors: Partial<Record<TransformPlatform, string>> = {};
    await Promise.all(selected.map(async platform => {
        try {
            const response = await configuredModel.generateContent([
                PROMPTS[platform](tone), `CONTENT TO TRANSFORM:\n${content}`,
            ]);
            const text = response.response.text();
            if (typeof text !== "string" || !text.trim()) throw new Error("Empty generated content");
            if (platform === "twitter") {
                const cleanText = text.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
                const thread: unknown = JSON.parse(cleanText);
                if (!Array.isArray(thread) || !thread.length ||
                    !thread.every(post => typeof post === "string" && post.trim().length > 0)) {
                    throw new Error("Invalid generated thread");
                }
                result.twitter = thread.map(post => post.trim());
            } else {
                result[platform] = text.trim();
            }
        } catch {
            // Provider errors and invalid responses are not generated content.
            // Keep diagnostics generic: SDK exceptions can include private data.
            errors[platform] = "Could not generate valid content. Please try again.";
        }
    }));
    if (Object.keys(errors).length) result.errors = errors;
    if (selected.every(platform => errors[platform])) {
        result.error = "No content was generated. Please try again.";
    }
    return result;
}

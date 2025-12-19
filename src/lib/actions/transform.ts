"use server";

import { model } from "@/lib/gemini";
import { PROMPTS } from "@/lib/ai/prompts";

export interface TransformResult {
    twitter?: string[];
    linkedin?: string;
    instagram?: string;
    error?: string;
}

export async function generateSocialContent(
    content: string,
    platforms: { twitter: boolean; linkedin: boolean; instagram: boolean },
    tone: string
): Promise<TransformResult> {
    const result: TransformResult = {};

    if (!model) {
        return { error: "AI model not configured" };
    }

    try {
        // Parallelize requests for selected platforms
        const promises = [];

        if (platforms.twitter) {
            promises.push(
                (async () => {
                    try {
                        const prompt = PROMPTS.twitter(tone);
                        const response = await model.generateContent([prompt, `CONTENT TO TRANSFORM:\n${content}`]);
                        const text = response.response.text();
                        // Clean up markdown code blocks if present
                        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
                        result.twitter = JSON.parse(cleanText);
                    } catch (e) {
                        console.error("Twitter transform error:", e);
                        result.twitter = ["Failed to generate Twitter thread."];
                    }
                })()
            );
        }

        if (platforms.linkedin) {
            promises.push(
                (async () => {
                    try {
                        const prompt = PROMPTS.linkedin(tone);
                        const response = await model.generateContent([prompt, `CONTENT TO TRANSFORM:\n${content}`]);
                        result.linkedin = response.response.text();
                    } catch (e) {
                        console.error("LinkedIn transform error:", e);
                        result.linkedin = "Failed to generate LinkedIn post.";
                    }
                })()
            );
        }

        if (platforms.instagram) {
            promises.push(
                (async () => {
                    try {
                        const prompt = PROMPTS.instagram(tone);
                        const response = await model.generateContent([prompt, `CONTENT TO TRANSFORM:\n${content}`]);
                        result.instagram = response.response.text();
                    } catch (e) {
                        console.error("Instagram transform error:", e);
                        result.instagram = "Failed to generate Instagram caption.";
                    }
                })()
            );
        }

        await Promise.all(promises);
        return result;

    } catch (error) {
        console.error("Transformation error:", error);
        return { error: "Failed to transform content" };
    }
}

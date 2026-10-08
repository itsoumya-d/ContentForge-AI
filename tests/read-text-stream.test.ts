import { describe, expect, it, vi } from "vitest";
import { readTextStream } from "@/lib/chat/read-text-stream";

const signal = () => new AbortController().signal;
const responseFrom = (chunks: Uint8Array[]) => new Response(new ReadableStream({
    start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk);
        controller.close();
    },
}));

describe("readTextStream", () => {
    it("preserves every possible UTF-8 split, including multibyte scripts and emoji", async () => {
        const expected = "Hello नमस्ते 🌍 café e\u0301";
        const bytes = new TextEncoder().encode(expected);
        for (let split = 1; split < bytes.length; split++) {
            const onText = vi.fn();
            const response = responseFrom([bytes.slice(0, split), bytes.slice(split)]);
            expect(await readTextStream(response, signal(), onText)).toBe(expected);
            expect(onText).toHaveBeenLastCalledWith(expected);
            expect(response.body?.locked).toBe(false);
        }
    });

    it("flushes the decoder at EOF", async () => {
        expect(await readTextStream(responseFrom([new Uint8Array([0xe2, 0x82])]), signal(), vi.fn()))
            .toBe("\uFFFD");
    });

    it.each([new Response(null), responseFrom([]), responseFrom([new TextEncoder().encode("  ")])])(
        "rejects missing or empty bodies", async response => {
            await expect(readTextStream(response, signal(), vi.fn())).rejects.toThrow();
            expect(response.body?.locked ?? false).toBe(false);
        },
    );

    it("rejects HTTP errors without displaying their body", async () => {
        const onText = vi.fn();
        await expect(readTextStream(new Response("private error details", { status: 500 }), signal(), onText))
            .rejects.toThrow("500");
        expect(onText).not.toHaveBeenCalled();
    });

    it("rejects interrupted streams after emitting partial text and releases the reader", async () => {
        let count = 0;
        const response = new Response(new ReadableStream({
            pull(controller) {
                if (count++ === 0) controller.enqueue(new TextEncoder().encode("Partial"));
                else controller.error(new Error("network dropped"));
            },
        }));
        const onText = vi.fn();
        await expect(readTextStream(response, signal(), onText)).rejects.toThrow("network dropped");
        expect(onText).toHaveBeenCalledWith("Partial");
        expect(response.body?.locked).toBe(false);
    });

    it("cancels a pending read without reporting a successful empty response", async () => {
        const cancel = vi.fn();
        const response = new Response(new ReadableStream({ cancel }));
        const controller = new AbortController();
        const onText = vi.fn();
        const result = readTextStream(response, controller.signal, onText);
        controller.abort();
        await expect(result).rejects.toMatchObject({ name: "AbortError" });
        expect(cancel).toHaveBeenCalledOnce();
        expect(onText).not.toHaveBeenCalled();
        expect(response.body?.locked).toBe(false);
    });

    it("does not consume an already-cancelled response", async () => {
        const controller = new AbortController();
        controller.abort();
        const onText = vi.fn();
        await expect(readTextStream(responseFrom([new TextEncoder().encode("late")]), controller.signal, onText))
            .rejects.toMatchObject({ name: "AbortError" });
        expect(onText).not.toHaveBeenCalled();
    });
});

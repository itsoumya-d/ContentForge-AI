import { describe, expect, it, vi } from "vitest";
import { createTextStream } from "@/lib/chat/create-text-stream";

describe("createTextStream", () => {
    it("encodes provider chunks and closes at EOF", async () => {
        const source = async function* () { yield "नमस्ते "; yield "🌍"; };
        const response = new Response(createTextStream(source, new AbortController().signal));
        expect(await response.text()).toBe("नमस्ते 🌍");
    });

    it("propagates a provider failure as a failed stream, not answer text", async () => {
        const source = async function* () { yield "partial"; throw new Error("provider details"); };
        const reader = createTextStream(source, new AbortController().signal).getReader();
        expect((await reader.read()).done).toBe(false);
        await expect(reader.read()).rejects.toThrow("Chat response interrupted");
    });

    it("forwards client cancellation to the provider and closes its iterator", async () => {
        let providerSignal: AbortSignal | undefined;
        const close = vi.fn().mockResolvedValue({ done: true });
        const source = (signal: AbortSignal) => {
            providerSignal = signal;
            return { [Symbol.asyncIterator]: () => ({ next: () => new Promise<IteratorResult<string>>(() => {}), return: close }) };
        };
        const reader = createTextStream(source, new AbortController().signal).getReader();
        const pending = reader.read();
        await reader.cancel();
        expect(await pending).toEqual({ done: true, value: undefined });
        expect(providerSignal?.aborted).toBe(true);
        expect(close).toHaveBeenCalledOnce();
    });

    it("aborts pending provider work when the incoming request disconnects", async () => {
        let resolve!: (value: IteratorResult<string>) => void;
        let providerSignal: AbortSignal | undefined;
        const close = vi.fn().mockResolvedValue({ done: true });
        const request = new AbortController();
        const source = (signal: AbortSignal) => {
            providerSignal = signal;
            return { [Symbol.asyncIterator]: () => ({ next: () => new Promise<IteratorResult<string>>(r => { resolve = r; }), return: close }) };
        };
        const reader = createTextStream(source, request.signal).getReader();
        const pending = reader.read();
        await Promise.resolve();
        request.abort();
        await expect(pending).rejects.toMatchObject({ name: "AbortError" });
        resolve({ value: "late chunk", done: false });
        await Promise.resolve();
        expect(providerSignal?.aborted).toBe(true);
        expect(close).toHaveBeenCalledOnce();
    });
});

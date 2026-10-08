/** Adapt a provider iterator to a response stream, forwarding disconnects upstream. */
export function createTextStream(
    source: (signal: AbortSignal) => AsyncIterable<string>,
    requestSignal: AbortSignal,
): ReadableStream<Uint8Array> {
    const abortController = new AbortController();
    const iterator = source(abortController.signal)[Symbol.asyncIterator]();
    const encoder = new TextEncoder();
    let closed = false;
    let onAbort: () => void;

    const cleanup = (reason?: unknown) => {
        closed = true;
        requestSignal.removeEventListener("abort", onAbort);
        abortController.abort(reason);
        // A provider can already be failed or awaiting a chunk when it is cancelled.
        void Promise.resolve().then(() => iterator.return?.()).catch(() => {});
    };

    return new ReadableStream<Uint8Array>({
        start(controller) {
            onAbort = () => {
                if (closed) return;
                cleanup(requestSignal.reason);
                controller.error(requestSignal.reason);
            };
            requestSignal.addEventListener("abort", onAbort, { once: true });
            if (requestSignal.aborted) onAbort();
        },
        async pull(controller) {
            if (closed) return;
            try {
                const { done, value } = await iterator.next();
                if (closed) return;
                if (done) {
                    closed = true;
                    requestSignal.removeEventListener("abort", onAbort);
                    controller.close();
                } else {
                    controller.enqueue(encoder.encode(value));
                }
            } catch (error) {
                if (closed) return;
                cleanup(error);
                controller.error(new Error("Chat response interrupted"));
            }
        },
        cancel(reason) {
            if (!closed) cleanup(reason);
        },
    });
}

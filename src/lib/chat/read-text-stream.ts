/** Read a UTF-8 response without splitting characters at network chunk boundaries. */
export async function readTextStream(
    response: Response,
    signal: AbortSignal,
    onText: (text: string) => void,
): Promise<string> {
    if (!response.ok) throw new Error(`Chat request failed (${response.status})`);
    if (!response.body) throw new Error("The response has no readable body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    let complete = false;
    const cancel = () => { void reader.cancel().catch(() => {}); };
    signal.addEventListener("abort", cancel, { once: true });

    try {
        signal.throwIfAborted();
        while (true) {
            const { done, value } = await reader.read();
            signal.throwIfAborted();
            if (done) break;
            text += decoder.decode(value, { stream: true });
            onText(text);
        }
        text += decoder.decode();
        if (!text.trim()) throw new Error("The response was empty");
        onText(text);
        complete = true;
        return text;
    } finally {
        signal.removeEventListener("abort", cancel);
        if (!complete) await reader.cancel().catch(() => {});
        reader.releaseLock();
    }
}

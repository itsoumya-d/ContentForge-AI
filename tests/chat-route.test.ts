import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/chat/route";

const { getSession, streamChat } = vi.hoisted(() => ({ getSession: vi.fn(), streamChat: vi.fn() }));
vi.mock("@/lib/firebase/server", () => ({ getSession }));
vi.mock("@/lib/gemini", () => ({ streamChat }));

const request = (body: object, signal?: AbortSignal) => new NextRequest("http://localhost/api/chat", {
    method: "POST", body: JSON.stringify(body), signal,
});
beforeEach(() => {
    getSession.mockReset().mockResolvedValue({ uid: "test-user" });
    streamChat.mockReset().mockImplementation(async function* () { yield "Test response"; });
});

describe("POST /api/chat", () => {
    it("keeps authentication required and never contacts a provider when unauthorized", async () => {
        getSession.mockResolvedValue(null);
        expect((await POST(request({ documentId: "test", message: "Hello" }))).status).toBe(401);
        expect(streamChat).not.toHaveBeenCalled();
    });

    it("keeps required-field validation", async () => {
        expect((await POST(request({ documentId: "test" }))).status).toBe(400);
        expect(streamChat).not.toHaveBeenCalled();
    });

    it("streams UTF-8 text with no-store and passes the provider an abort signal", async () => {
        const history = [{ role: "user", parts: [{ text: "Before" }] }];
        const response = await POST(request({ documentId: "test", message: "Hello", context: "Document", history }));
        expect(response.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
        expect(response.headers.get("Cache-Control")).toBe("no-store");
        expect(await response.text()).toBe("Test response");
        expect(streamChat).toHaveBeenCalledWith(history, "Hello", "Document", expect.any(AbortSignal));
    });

    it("fails the response stream when the provider fails", async () => {
        streamChat.mockImplementation(async function* () { throw new Error("provider failure"); });
        const response = await POST(request({ documentId: "test", message: "Hello" }));
        await expect(response.text()).rejects.toThrow("Chat response interrupted");
    });
});

// @vitest-environment jsdom
import React, { type ReactNode, type Ref } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChatInterface } from "@/components/dashboard/chat-interface";

const { saveMessage } = vi.hoisted(() => ({ saveMessage: vi.fn() }));
vi.mock("@/lib/actions/chat", () => ({ saveMessage }));
vi.mock("@/components/ui/scroll-area", () => ({
    ScrollArea: ({ children, viewportRef }: { children: ReactNode; viewportRef: Ref<HTMLDivElement> }) => <div ref={viewportRef}>{children}</div>,
}));
vi.mock("framer-motion", () => ({
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
    motion: { div: ({ children, className }: { children: ReactNode; className: string }) => <div className={className}>{children}</div> },
}));

const fetchMock = vi.fn();
const mount = () => render(<ChatInterface documentId="document" chatId="chat" />);
const send = (question = "Summarize this document") => {
    fireEvent.change(screen.getByRole("textbox", { name: "Ask a question" }), { target: { value: question } });
    fireEvent.submit(screen.getByRole("button", { name: "Send message" }).closest("form")!);
};
const idle = async () => waitFor(() => expect((screen.getByRole("button", { name: "Send message" }) as HTMLButtonElement).disabled).toBe(true));
const modelSaves = () => saveMessage.mock.calls.filter(call => call[2] === "model");

beforeEach(() => {
    saveMessage.mockReset().mockResolvedValue("saved-message-id");
    fetchMock.mockReset().mockResolvedValue(new Response("A complete answer"));
    vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("ChatInterface streaming lifecycle", () => {
    it("renders split Unicode and persists exactly the completed answer", async () => {
        const bytes = new TextEncoder().encode("नमस्ते 🌍");
        fetchMock.mockResolvedValue(new Response(new ReadableStream({ start(controller) {
            for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
            controller.close();
        } })));
        mount(); send();
        await screen.findByText("नमस्ते 🌍");
        await waitFor(() => expect(modelSaves()).toHaveLength(1));
        expect(modelSaves()[0][3]).toBe("नमस्ते 🌍");
        expect(fetchMock.mock.calls[0][1].headers).toEqual({ "Content-Type": "application/json" });
    });

    it("rejects repeated submits in the same tick before loading state renders", async () => {
        let finishSave!: () => void;
        saveMessage.mockImplementationOnce(() => new Promise<void>(resolve => { finishSave = resolve; }));
        mount();
        fireEvent.change(screen.getByRole("textbox"), { target: { value: "One question" } });
        const form = screen.getByRole("button", { name: "Send message" }).closest("form")!;
        act(() => { fireEvent.submit(form); fireEvent.submit(form); });
        expect(saveMessage).toHaveBeenCalledOnce();
        await act(async () => { finishSave(); });
        await waitFor(() => expect(modelSaves()).toHaveLength(1));
        expect(fetchMock).toHaveBeenCalledOnce();
        expect(screen.getAllByText("One question")).toHaveLength(1);
    });

    it.each(["http", "missing body", "empty body", "network"])("shows a recoverable alert for %s failure", async kind => {
        if (kind === "network") fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
        else fetchMock.mockResolvedValueOnce(kind === "http" ? new Response("private", { status: 503 }) : new Response(kind === "empty body" ? "" : null));
        mount(); send();
        expect((await screen.findByRole("alert")).textContent).toContain("couldn't finish");
        expect(modelSaves()).toHaveLength(0);
        fireEvent.click(screen.getByRole("button", { name: "Retry" }));
        await screen.findByText("A complete answer");
        await waitFor(() => expect(modelSaves()).toHaveLength(1));
        expect(saveMessage.mock.calls.filter(call => call[2] === "user")).toHaveLength(1);
        expect(screen.queryByRole("alert")).toBeNull();
    });

    it("labels an interrupted reply and never saves its partial content", async () => {
        let controller!: ReadableStreamDefaultController<Uint8Array>;
        fetchMock.mockResolvedValue(new Response(new ReadableStream({ start(value) { controller = value; } })));
        mount(); send();
        await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
        await act(async () => { controller.enqueue(new TextEncoder().encode("Partial answer")); });
        await screen.findByText("Partial answer");
        await act(async () => { controller.error(new Error("connection lost")); });
        await screen.findByRole("alert");
        expect(screen.getByText("Incomplete response")).toBeTruthy();
        expect(modelSaves()).toHaveLength(0);
        fireEvent.click(screen.getByRole("button", { name: "Ask a different question" }));
        fetchMock.mockResolvedValue(new Response("New answer"));
        send("Different question");
        await screen.findByText("New answer");
        expect(JSON.parse(fetchMock.mock.calls[1][1].body).history).toEqual([]);
    });

    it("stops a pending read and allows retry without duplicating the user message", async () => {
        const cancel = vi.fn();
        fetchMock.mockResolvedValueOnce(new Response(new ReadableStream({ cancel })));
        mount(); send();
        fireEvent.click(await screen.findByRole("button", { name: "Stop response" }));
        expect((await screen.findByRole("alert")).textContent).toContain("Response stopped");
        expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
        expect(cancel).toHaveBeenCalledOnce();
        expect(modelSaves()).toHaveLength(0);
        fireEvent.click(screen.getByRole("button", { name: "Retry" }));
        await screen.findByText("A complete answer");
        await waitFor(() => expect(modelSaves()).toHaveLength(1));
        expect(saveMessage.mock.calls.filter(call => call[2] === "user")).toHaveLength(1);
    });

    it("aborts and releases a stream on unmount without saving its reply", async () => {
        const cancel = vi.fn();
        fetchMock.mockResolvedValue(new Response(new ReadableStream({ cancel })));
        const view = mount(); send();
        await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
        await act(async () => { view.unmount(); });
        expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
        expect(cancel).toHaveBeenCalledOnce();
        expect(modelSaves()).toHaveLength(0);
    });

    it("does not start a fetch after unmount during the initial save", async () => {
        let finishSave!: () => void;
        saveMessage.mockImplementationOnce(() => new Promise<void>(resolve => { finishSave = resolve; }));
        const view = mount(); send(); view.unmount();
        await act(async () => { finishSave(); });
        expect(fetchMock).not.toHaveBeenCalled();
        expect(modelSaves()).toHaveLength(0);
    });

    it("cancels old requests and resets history when the chat changes", async () => {
        fetchMock.mockResolvedValueOnce(new Response(new ReadableStream()));
        const view = mount(); send();
        await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
        await act(async () => { view.rerender(<ChatInterface documentId="other-document" chatId="other-chat" />); });
        expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
        expect(screen.queryByText("Summarize this document")).toBeNull();
        send("New chat");
        await screen.findByText("A complete answer");
        expect(JSON.parse(fetchMock.mock.calls[1][1].body).history).toEqual([]);
    });

    it("retries a failed reply save without regenerating the reply", async () => {
        saveMessage.mockResolvedValueOnce("user-id").mockRejectedValueOnce(new Error("unavailable"));
        mount(); send();
        expect((await screen.findByRole("alert")).textContent).toContain("could not be saved");
        fireEvent.click(screen.getByRole("button", { name: "Retry" }));
        await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
        expect(fetchMock).toHaveBeenCalledOnce();
        expect(modelSaves()).toHaveLength(2);
        expect(modelSaves()[1][3]).toBe("A complete answer");
        await idle();
    });
});

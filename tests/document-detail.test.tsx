// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { DocumentMetadata } from "@/lib/actions/documents";
const { createChatSession, getChatHistory, chat } = vi.hoisted(() => ({ createChatSession: vi.fn(), getChatHistory: vi.fn().mockResolvedValue([]), chat: vi.fn() }));
vi.mock("@/lib/actions/chat", () => ({ createChatSession, getChatHistory }));
vi.mock("@/components/dashboard/chat-interface", () => ({ ChatInterface: (props: unknown) => { chat(props); return <div>Verified chat</div>; } }));
import DocumentDetail from "@/components/dashboard/document-detail";
const document: DocumentMetadata & {id: string} = {id: "test", name: "Report.pdf", type: "application/pdf", size: 42, url: "https://example.invalid/report", storagePath: "test", status: "unprocessed", createdAt: "2026-10-14T00:00:00Z"};
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it.each(["unprocessed", "completed", "error"] as const)("does not present unverified %s summaries or initialize chat", async status => {
 render(<DocumentDetail document={{...document, status, summary: "Invented filename summary", tags: ["invented"]}} />);
 expect(screen.queryByText("Invented filename summary")).toBeNull();
 expect(screen.queryByText("#invented")).toBeNull();
 expect(screen.queryByText("Professional & Informative")).toBeNull();
 expect(screen.queryByText("Positive")).toBeNull();
 expect(screen.getByText(/Document chat requires a verified/)).toBeTruthy();
 expect(createChatSession).not.toHaveBeenCalled(); expect(getChatHistory).not.toHaveBeenCalled(); expect(chat).not.toHaveBeenCalled();
});
it("keeps future verified content summaries usable without static invented insights", async () => {
 render(<DocumentDetail initialChatId="chat1" document={{...document, status: "completed", analysisVersion: 1, summary: "Verified content summary"}} />);
 await waitFor(() => expect(screen.getByText("Verified chat")).toBeTruthy());
 expect(screen.getByText("Verified content summary")).toBeTruthy();
 expect(chat).toHaveBeenCalledWith(expect.objectContaining({context: "Verified content summary"}));
 expect(screen.queryByText("Positive")).toBeNull();
});
it("does not use blank verified summaries as chat context", () => {
 render(<DocumentDetail document={{...document, status: "completed", analysisVersion: 1, summary: "  "}} />);
 expect(chat).not.toHaveBeenCalled(); expect(createChatSession).not.toHaveBeenCalled();
});

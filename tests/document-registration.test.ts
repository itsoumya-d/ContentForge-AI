import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ session: vi.fn(), subscription: vi.fn(), add: vi.fn(), update: vi.fn(), analyze: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/firebase/server", () => ({ getSession: mocks.session }));
vi.mock("@/lib/actions/user", () => ({ getUserSubscription: mocks.subscription }));
vi.mock("@/lib/gemini", () => ({ analyzeDocument: mocks.analyze }));
vi.mock("@/lib/firebase/admin", () => {
 const documents = { add: mocks.add, doc: () => ({ update: mocks.update }) };
 return { adminDb: { collection: () => ({ doc: () => ({ collection: () => documents }) }) } };
});
import { registerDocument } from "@/lib/actions/documents";
const metadata = { name: "Quarterly report.pdf", type: "application/pdf", size: 42, url: "https://example.invalid/file", storagePath: "users/test/documents/report.pdf" };
beforeEach(() => { vi.resetAllMocks(); mocks.session.mockResolvedValue({ uid: "test" }); mocks.subscription.mockResolvedValue({documentsUsed: 0, documentLimit: 5}); mocks.add.mockResolvedValue({ id: "doc1" }); mocks.analyze.mockResolvedValue({summary: "Invented from filename", tags: ["fiction"]}); });
it("registers metadata as unprocessed without sending a filename to the model", async () => {
 expect(await registerDocument(metadata)).toEqual({ id: "doc1" });
 expect(mocks.add).toHaveBeenCalledWith(expect.objectContaining({status: "unprocessed"}));
 expect(mocks.analyze).not.toHaveBeenCalled();
 expect(mocks.update).not.toHaveBeenCalled();
});
it("does not persist caller-supplied analysis or status as trusted content", async () => {
 await registerDocument({...metadata, status: "completed", summary: "untrusted", tags: ["untrusted"], analysisVersion: 1} as typeof metadata);
 const saved = mocks.add.mock.calls[0][0];
 expect(saved.status).toBe("unprocessed"); expect(saved.summary).toBeUndefined(); expect(saved.tags).toBeUndefined(); expect(saved.analysisVersion).toBeUndefined();
});
it("requires a session before registration", async () => {
 mocks.session.mockResolvedValue(null); await expect(registerDocument(metadata)).rejects.toThrow("Unauthorized"); expect(mocks.add).not.toHaveBeenCalled();
});
it("preserves subscription limits", async () => {
 mocks.subscription.mockResolvedValue({documentsUsed: 5, documentLimit: 5}); await expect(registerDocument(metadata)).rejects.toThrow("limit"); expect(mocks.add).not.toHaveBeenCalled();
});

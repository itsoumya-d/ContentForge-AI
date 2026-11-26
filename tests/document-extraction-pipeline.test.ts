import { describe, expect, it, vi } from "vitest";
import {
    hasVerifiedDocumentAnalysis,
    sanitizeDocumentText,
    computeContentChecksum,
    chunkDocumentContent,
    processDocumentExtraction,
} from "@/lib/document-analysis";
import type { DocumentMetadata } from "@/lib/actions/documents";

describe("Document extraction and verification pipeline", () => {
    it("sanitizes text by stripping null bytes and zero-width characters", () => {
        const dirty = "Line 1\r\nLine 2\x00\u200B\uFEFFwith zero width  \r\nLine 3";
        const cleaned = sanitizeDocumentText(dirty);
        expect(cleaned).toBe("Line 1\nLine 2with zero width\nLine 3");
        expect(cleaned).not.toContain("\x00");
        expect(cleaned).not.toContain("\u200B");
        expect(cleaned).not.toContain("\uFEFF");
    });

    it("computes deterministic SHA-256 content checksums", () => {
        const hash1 = computeContentChecksum("enterprise architecture contract");
        const hash2 = computeContentChecksum("enterprise architecture contract");
        const hashOther = computeContentChecksum("different content");

        expect(hash1).toHaveLength(64);
        expect(hash1).toBe(hash2);
        expect(hash1).not.toBe(hashOther);

        const bytes = new TextEncoder().encode("enterprise architecture contract");
        expect(computeContentChecksum(bytes)).toBe(hash1);
    });

    it("chunks content with boundary preservation and token estimation", () => {
        const sample = `Paragraph 1 introduces the system architecture and its core invariants.

Paragraph 2 details the event pipeline, streaming consensus, and message routing.

Paragraph 3 outlines failover mechanics, persistence guarantees, and disaster recovery.`;

        const chunks = chunkDocumentContent(sample, { chunkSize: 90, overlap: 20 });
        expect(chunks.length).toBeGreaterThan(1);

        for (const chunk of chunks) {
            expect(chunk.text.length).toBeGreaterThan(0);
            expect(chunk.tokenEstimate).toBeGreaterThan(0);
            expect(chunk.startChar).toBeLessThan(chunk.endChar);
            expect(chunk.charCount).toBe(chunk.text.length);
        }

        expect(chunkDocumentContent("")).toEqual([]);
        expect(chunkDocumentContent("   \x00\u200B  ")).toEqual([]);
    });

    it("rejects empty content payloads", async () => {
        const res = await processDocumentExtraction("", "text/plain");
        expect(res.ok).toBe(false);
        expect(res.status).toBe("error");
        expect(res.analysisVersion).toBeUndefined();
        expect(res.error).toMatch(/empty/i);
    });

    it("rejects payloads exceeding configured max byte limit", async () => {
        const bigContent = "x".repeat(200);
        const res = await processDocumentExtraction(bigContent, "text/plain", { maxBytes: 100 });
        expect(res.ok).toBe(false);
        expect(res.status).toBe("error");
        expect(res.analysisVersion).toBeUndefined();
        expect(res.error).toMatch(/exceeds/i);
    });

    it("rejects unsupported MIME types", async () => {
        const res = await processDocumentExtraction("sample content", "application/x-executable");
        expect(res.ok).toBe(false);
        expect(res.status).toBe("error");
        expect(res.analysisVersion).toBeUndefined();
        expect(res.error).toMatch(/unsupported/i);
    });

    it("rejects content that contains no printable text after sanitization", async () => {
        const res = await processDocumentExtraction("\x00\u200B\uFEFF   ", "text/plain");
        expect(res.ok).toBe(false);
        expect(res.status).toBe("error");
        expect(res.analysisVersion).toBeUndefined();
        expect(res.error).toMatch(/no valid printable text/i);
    });

    it("handles analyzer errors gracefully without setting analysisVersion: 1", async () => {
        const mockAnalyzer = vi.fn().mockRejectedValue(new Error("Model rate limit exceeded"));
        const res = await processDocumentExtraction("valid document body", "text/plain", {
            customAnalyzer: mockAnalyzer,
        });

        expect(res.ok).toBe(false);
        expect(res.status).toBe("error");
        expect(res.analysisVersion).toBeUndefined();
        expect(res.error).toBe("Model rate limit exceeded");
    });

    it("completes full verified extraction pipeline with analysisVersion: 1", async () => {
        const mockAnalyzer = vi.fn().mockResolvedValue({
            summary: "Enterprise architecture verified analysis.",
            tags: ["cloud", "observability", "enterprise"],
        });

        const raw = "Enterprise Architecture Overview.\r\n\r\nCovers distributed deployment on AWS and Azure.\x00";
        const res = await processDocumentExtraction(raw, "text/plain", { customAnalyzer: mockAnalyzer });

        expect(res.ok).toBe(true);
        expect(res.status).toBe("completed");
        expect(res.analysisVersion).toBe(1);
        expect(res.summary).toBe("Enterprise architecture verified analysis.");
        expect(res.tags).toEqual(["cloud", "observability", "enterprise"]);
        expect(res.checksum).toBeDefined();
        expect(res.chunks?.length).toBeGreaterThan(0);
        expect(res.processedAt).toBeDefined();

        // Verify compatibility with hasVerifiedDocumentAnalysis
        const docRecord: DocumentMetadata = {
            name: "spec.txt",
            type: "text/plain",
            size: raw.length,
            url: "https://example.invalid/spec.txt",
            storagePath: "users/1/docs/spec.txt",
            status: res.status,
            analysisVersion: res.analysisVersion,
            summary: res.summary,
            tags: res.tags,
            createdAt: new Date().toISOString(),
        };

        expect(hasVerifiedDocumentAnalysis(docRecord)).toBe(true);
    });
});

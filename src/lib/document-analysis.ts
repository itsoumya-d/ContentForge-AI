import { createHash } from "node:crypto";
import type { DocumentMetadata } from "@/lib/actions/documents";
import { analyzeDocument } from "@/lib/gemini";

/** Legacy summaries were generated from filenames, not document content. */
export function hasVerifiedDocumentAnalysis(document: DocumentMetadata): boolean {
    return document.status === "completed" && document.analysisVersion === 1
        && typeof document.summary === "string" && document.summary.trim().length > 0;
}

export interface DocumentValidationOptions {
    maxBytes?: number;
    allowedMimeTypes?: string[];
}

export interface DocumentChunk {
    index: number;
    text: string;
    charCount: number;
    tokenEstimate: number;
    startChar: number;
    endChar: number;
}

export interface ExtractionPipelineResult {
    ok: boolean;
    checksum?: string;
    sanitizedText?: string;
    chunks?: DocumentChunk[];
    summary?: string;
    tags?: string[];
    analysisVersion?: 1;
    status: "completed" | "error";
    error?: string;
    processedAt?: string;
}

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024; // 10MB
const DEFAULT_ALLOWED_MIMES = [
    "text/plain",
    "text/markdown",
    "application/json",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/**
 * Strips zero-width characters, null bytes, and normalizes line endings.
 */
export function sanitizeDocumentText(rawText: string): string {
    if (!rawText) return "";
    return rawText
        .replace(/\x00/g, "")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+$/gm, "")
        .trim();
}

/**
 * Computes deterministic SHA-256 hex digest for document provenance.
 */
export function computeContentChecksum(content: string | Uint8Array): string {
    const hash = createHash("sha256");
    if (typeof content === "string") {
        hash.update(content, "utf8");
    } else {
        hash.update(content);
    }
    return hash.digest("hex");
}

/**
 * Splits sanitized text into deterministic context chunks with boundary awareness.
 */
export function chunkDocumentContent(
    text: string,
    options?: { chunkSize?: number; overlap?: number }
): DocumentChunk[] {
    const sanitized = sanitizeDocumentText(text);
    if (!sanitized) return [];

    const chunkSize = options?.chunkSize && options.chunkSize > 50 ? options.chunkSize : 1000;
    const overlap = options?.overlap !== undefined && options.overlap >= 0 && options.overlap < chunkSize ? options.overlap : 100;

    const chunks: DocumentChunk[] = [];
    let startChar = 0;
    let chunkIndex = 0;

    while (startChar < sanitized.length) {
        let endChar = Math.min(startChar + chunkSize, sanitized.length);

        if (endChar < sanitized.length) {
            const searchWindow = sanitized.slice(startChar, endChar);
            const naturalBoundary = searchWindow.lastIndexOf("\n\n");
            const sentenceBoundary = searchWindow.lastIndexOf(". ");
            const spaceBoundary = searchWindow.lastIndexOf(" ");

            if (naturalBoundary > chunkSize * 0.5) {
                endChar = startChar + naturalBoundary + 2;
            } else if (sentenceBoundary > chunkSize * 0.6) {
                endChar = startChar + sentenceBoundary + 2;
            } else if (spaceBoundary > chunkSize * 0.7) {
                endChar = startChar + spaceBoundary + 1;
            }
        }

        const chunkText = sanitized.slice(startChar, endChar).trim();
        if (chunkText.length > 0) {
            chunks.push({
                index: chunkIndex++,
                text: chunkText,
                charCount: chunkText.length,
                tokenEstimate: Math.max(1, Math.ceil(chunkText.length / 4)),
                startChar,
                endChar,
            });
        }

        if (endChar >= sanitized.length) {
            break;
        }

        startChar = Math.max(startChar + 1, endChar - overlap);
    }

    return chunks;
}

/**
 * Server-side extraction and analysis verification pipeline.
 * Sets analysisVersion: 1 and status: 'completed' ONLY upon valid verified extraction and model response.
 */
export async function processDocumentExtraction(
    content: string | Uint8Array,
    mimeType: string,
    options?: DocumentValidationOptions & {
        customAnalyzer?: (content: string, type: string) => Promise<{ summary: string; tags: string[] }>;
    }
): Promise<ExtractionPipelineResult> {
    const maxBytes = options?.maxBytes ?? DEFAULT_MAX_BYTES;
    const allowedMimes = options?.allowedMimeTypes ?? DEFAULT_ALLOWED_MIMES;

    const byteLength = typeof content === "string" ? Buffer.byteLength(content, "utf8") : content.byteLength;

    if (byteLength === 0) {
        return {
            ok: false,
            status: "error",
            error: "Document content is empty",
        };
    }

    if (byteLength > maxBytes) {
        return {
            ok: false,
            status: "error",
            error: `Document exceeds maximum allowed size of ${maxBytes} bytes`,
        };
    }

    if (!allowedMimes.includes(mimeType)) {
        return {
            ok: false,
            status: "error",
            error: `Unsupported document MIME type: ${mimeType}`,
        };
    }

    const text = typeof content === "string" ? content : Buffer.from(content).toString("utf8");
    const sanitized = sanitizeDocumentText(text);

    if (!sanitized) {
        return {
            ok: false,
            status: "error",
            error: "Document content contains no valid printable text after sanitization",
        };
    }

    const checksum = computeContentChecksum(content);
    const chunks = chunkDocumentContent(sanitized);

    try {
        const analyzer = options?.customAnalyzer ?? analyzeDocument;
        const analysis = await analyzer(sanitized, mimeType);

        if (!analysis.summary || !analysis.summary.trim()) {
            return {
                ok: false,
                status: "error",
                error: "Model returned empty summary",
            };
        }

        return {
            ok: true,
            status: "completed",
            analysisVersion: 1,
            checksum,
            sanitizedText: sanitized,
            chunks,
            summary: analysis.summary.trim(),
            tags: Array.isArray(analysis.tags) ? analysis.tags.map((t) => t.trim()).filter(Boolean) : [],
            processedAt: new Date().toISOString(),
        };
    } catch (err) {
        return {
            ok: false,
            status: "error",
            error: err instanceof Error ? err.message : "Document analysis failed",
        };
    }
}

import type { DocumentMetadata } from "@/lib/actions/documents";

/** Legacy summaries were generated from filenames, not document content. */
export function hasVerifiedDocumentAnalysis(document: DocumentMetadata): boolean {
    return document.status === "completed" && document.analysisVersion === 1
        && typeof document.summary === "string" && document.summary.trim().length > 0;
}

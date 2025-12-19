// Common type definitions for ContentForge AI

// User types
export interface User {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// Document types
export interface Document {
    id: string;
    userId: string;
    name: string;
    type: DocumentType;
    size: number;
    mimeType: string;
    storagePath: string;
    status: ProcessingStatus;
    metadata: DocumentMetadata;
    createdAt: Date;
    updatedAt: Date;
}

export type DocumentType = "pdf" | "docx" | "image" | "audio" | "video" | "text";

export type ProcessingStatus = "pending" | "processing" | "ready" | "error";

export interface DocumentMetadata {
    pages?: number;
    duration?: number; // seconds for audio/video
    width?: number;
    height?: number;
    wordCount?: number;
}

// Chat types
export interface ChatMessage {
    id: string;
    conversationId: string;
    role: "user" | "assistant";
    content: string;
    citations?: Citation[];
    createdAt: Date;
}

export interface Conversation {
    id: string;
    documentId: string;
    userId: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Citation {
    text: string;
    pageNumber?: number;
    startOffset?: number;
    endOffset?: number;
}

// Transformation types
export interface Transformation {
    id: string;
    documentId: string;
    userId: string;
    type: TransformationType;
    input: Record<string, unknown>;
    output: TransformationOutput;
    status: ProcessingStatus;
    createdAt: Date;
}

export type TransformationType =
    | "summarize"
    | "blog_to_social"
    | "transcribe"
    | "extract_key_points"
    | "translate";

export interface TransformationOutput {
    content: string;
    metadata?: Record<string, unknown>;
}

// Subscription types
export interface Subscription {
    id: string;
    userId: string;
    plan: PlanTier;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
}

export type PlanTier = "free" | "starter" | "pro" | "business" | "enterprise";

export type SubscriptionStatus =
    | "active"
    | "canceled"
    | "past_due"
    | "trialing";

// Usage types
export interface UsageRecord {
    userId: string;
    period: string; // YYYY-MM
    transformsUsed: number;
    storageUsed: number; // bytes
    apiCallsUsed: number;
}

// API Response types
export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
    };
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

// Component prop types
export interface PageProps {
    params: Promise<{ [key: string]: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

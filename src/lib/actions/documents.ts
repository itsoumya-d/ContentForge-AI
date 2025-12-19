"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { getSession } from "@/lib/firebase/server";
import { analyzeDocument } from "@/lib/gemini";
import { getUserSubscription } from "./user";

export type DocumentMetadata = {
    name: string;
    type: string;
    size: number;
    url: string;
    storagePath: string;
    status: "processing" | "completed" | "error";
    createdAt: string;
    summary?: string;
    tags?: string[];
};

export async function registerDocument(metadata: Omit<DocumentMetadata, "createdAt" | "status">) {
    const session = await getSession();
    if (!session) {
        throw new Error("Unauthorized");
    }

    const userId = session.uid;
    const db = adminDb;

    if (!db) {
        throw new Error("Firestore Admin not initialized");
    }

    // Check subscription limits
    const subscription = await getUserSubscription();
    if (subscription.documentsUsed >= subscription.documentLimit) {
        throw new Error(`You have reached your limit of ${subscription.documentLimit} documents. Please upgrade your plan.`);
    }

    const docRef = await db.collection("users").doc(userId).collection("documents").add({
        ...metadata,
        status: "processing",
        createdAt: new Date().toISOString(),
    });

    // Simple background-like trigger for analysis
    // In a real app, this would be a background job
    (async () => {
        try {
            // For now, we only analyze it if we have text content or just the name/type
            // Real integration would fetch the file and send to Gemini
            const analysis = await analyzeDocument(`Document: ${metadata.name}`, metadata.type);

            await db.collection("users").doc(userId).collection("documents").doc(docRef.id).update({
                status: "completed",
                summary: analysis.summary,
                tags: analysis.tags,
            });
        } catch (error) {
            console.error("Delayed analysis error:", error);
            await db.collection("users").doc(userId).collection("documents").doc(docRef.id).update({
                status: "error",
            });
        }
    })();

    revalidatePath("/dashboard");

    return { id: docRef.id };
}

export async function getUserDocuments() {
    const session = await getSession();
    if (!session) return [];

    const userId = session.uid;
    const db = adminDb;

    if (!db || typeof db.collection !== 'function') {
        console.warn("Firestore Admin not initialized, returning empty docs");
        return [];
    }

    const snapshot = await db
        .collection("users")
        .doc(userId)
        .collection("documents")
        .orderBy("createdAt", "desc")
        .get();

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as DocumentMetadata),
    }));
}

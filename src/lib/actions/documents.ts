"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { getSession } from "@/lib/firebase/server";
import { getUserSubscription } from "./user";

export type DocumentMetadata = {
    name: string;
    type: string;
    size: number;
    url: string;
    storagePath: string;
    status: "unprocessed" | "processing" | "completed" | "error";
    /** Set only by a future server-side content extraction/analysis pipeline. */
    analysisVersion?: 1;
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
        name: metadata.name,
        type: metadata.type,
        size: metadata.size,
        url: metadata.url,
        storagePath: metadata.storagePath,
        status: "unprocessed",
        createdAt: new Date().toISOString(),
    });

    // Upload registration stores metadata only. No file content is extracted here.
    // Never send a filename to the model or label that response as an analysis.
    // Await a real content-processing pipeline before enabling document chat.

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

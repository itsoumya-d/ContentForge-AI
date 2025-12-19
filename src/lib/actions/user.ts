"use server";

import { adminDb } from "@/lib/firebase/admin";
import { getSession } from "@/lib/firebase/server";

export type UserSubscription = {
    plan: "Free" | "Starter" | "Pro";
    status: string;
    currentPeriodEnd?: string;
    documentsUsed: number;
    documentLimit: number;
    storageUsed: number;
    storageLimit: number;
};

export async function getUserSubscription(): Promise<UserSubscription> {
    const session = await getSession();
    if (!session) {
        return { plan: "Free", status: "none", documentsUsed: 0, documentLimit: 5, storageUsed: 0, storageLimit: 100 * 1024 * 1024 };
    }

    const userId = session.uid;
    const db = adminDb;

    if (!db) {
        return { plan: "Free", status: "none", documentsUsed: 0, documentLimit: 5, storageUsed: 0, storageLimit: 100 * 1024 * 1024 };
    }

    const userDoc = await db.collection("users").doc(userId).get();

    const userData = userDoc?.data() || {};
    const plan = userData.plan || "Free";
    const status = userData.status || "none";

    // Fetch current document metadata for count and size
    const docsSnapshot = await db.collection("users").doc(userId).collection("documents").get();
    const documentsUsed = docsSnapshot.size;
    const storageUsed = docsSnapshot.docs.reduce((acc, doc) => acc + (doc.data().size || 0), 0);

    let documentLimit = 5;
    let storageLimit = 100 * 1024 * 1024; // 100 MB

    if (plan === "Starter") {
        documentLimit = 50;
        storageLimit = 1024 * 1024 * 1024; // 1 GB
    }
    if (plan === "Pro") {
        documentLimit = 1000000;
        storageLimit = 100 * 1024 * 1024 * 1024; // 100 GB (pseudo-unlimited)
    }

    return {
        plan,
        status,
        currentPeriodEnd: userData.currentPeriodEnd?.toDate?.()?.toISOString() || userData.currentPeriodEnd,
        documentsUsed,
        documentLimit,
        storageUsed,
        storageLimit,
    };
}

"use server";

import { adminDb } from "@/lib/firebase/admin";
import { getSession } from "@/lib/firebase/server";
import { revalidatePath } from "next/cache";

export type Message = {
    id: string;
    role: "user" | "model";
    content: string;
    createdAt: string;
};

export async function createChatSession(documentId: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const userId = session.uid;
    const db = adminDb;
    if (!db) throw new Error("Database not initialized");

    const chatRef = await db
        .collection("users")
        .doc(userId)
        .collection("documents")
        .doc(documentId)
        .collection("chats")
        .add({
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

    return chatRef.id;
}

export async function saveMessage(documentId: string, chatId: string, role: "user" | "model", content: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const userId = session.uid;
    const db = adminDb;
    if (!db) throw new Error("Database not initialized");

    const messageRef = await db
        .collection("users")
        .doc(userId)
        .collection("documents")
        .doc(documentId)
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .add({
            role,
            content,
            createdAt: new Date().toISOString(),
        });

    // Update last seen in chat
    await db
        .collection("users")
        .doc(userId)
        .collection("documents")
        .doc(documentId)
        .collection("chats")
        .doc(chatId)
        .update({
            updatedAt: new Date().toISOString(),
        });

    return messageRef.id;
}

export async function getChatHistory(documentId: string, chatId: string) {
    const session = await getSession();
    if (!session) return [];

    const userId = session.uid;
    const db = adminDb;
    if (!db) return [];

    const snapshot = await db
        .collection("users")
        .doc(userId)
        .collection("documents")
        .doc(documentId)
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .orderBy("createdAt", "asc")
        .get();

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, "id">),
    }));
}

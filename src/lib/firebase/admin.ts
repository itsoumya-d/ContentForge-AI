import * as admin from "firebase-admin";

const firebaseAdminConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// Only initialize if we have the necessary configuration
// This prevents build errors during static generation if env vars are missing
if (!admin.apps.length && firebaseAdminConfig.projectId && firebaseAdminConfig.clientEmail) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(firebaseAdminConfig),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
    } catch (error) {
        console.error("Firebase admin initialization error", error);
    }
}

// Export a getter for adminAuth to handle cases where it's not initialized
export const getAdminAuth = () => {
    if (!admin.apps.length) return null;
    return admin.auth();
};

export const getAdminDb = () => {
    if (!admin.apps.length) return null;
    return admin.firestore();
};

export const getAdminStorage = () => {
    if (!admin.apps.length) return null;
    return admin.storage();
};

// Preserve old exports for compatibility but use getters internally or carefully
export const adminAuth = admin.apps.length ? admin.auth() : (null as unknown as admin.auth.Auth);
export const adminDb = admin.apps.length ? admin.firestore() : (null as unknown as admin.firestore.Firestore);
export const adminStorage = admin.apps.length ? admin.storage() : (null as unknown as admin.storage.Storage);

import { cookies } from "next/headers";
import { getAdminAuth } from "./admin";

export async function getSession() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) return null;

    const auth = getAdminAuth();
    if (!auth) {
        console.warn("Firebase Admin Auth not initialized");
        return null;
    }

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        return decodedClaims;
    } catch (error) {
        return null;
    }
}

export async function createSession(idToken: string) {
    const auth = getAdminAuth();
    if (!auth) throw new Error("Firebase Admin Auth not initialized");

    const cookieStore = await cookies();

    // Set session expiration to 5 days
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    const options = {
        name: "session",
        value: sessionCookie,
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
    };

    cookieStore.set(options.name, options.value, options);
}

export async function removeSession() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

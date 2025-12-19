"use server";

import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/admin";
import { createSession, removeSession } from "@/lib/firebase/server";
import { loginSchema, signupSchema } from "@/lib/validations/auth";
import { auth as clientAuth } from "@/lib/firebase/config";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export type AuthActionResult = {
    error?: string;
    success?: boolean;
};

export async function login(
    prevState: AuthActionResult | null,
    formData: FormData
): Promise<AuthActionResult> {
    const rawData = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const validatedData = loginSchema.safeParse(rawData);

    if (!validatedData.success) {
        return {
            error: validatedData.error.issues[0]?.message || "Invalid input",
        };
    }

    try {
        // Note: We use the client SDK on the server here. 
        // It works, but we need the ID token to set the session cookie.
        const userCredential = await signInWithEmailAndPassword(
            clientAuth,
            validatedData.data.email,
            validatedData.data.password
        );

        const idToken = await userCredential.user.getIdToken();
        await createSession(idToken);
    } catch (error: any) {
        return {
            error: error.message || "Failed to sign in",
        };
    }

    redirect("/dashboard");
}

export async function signup(
    prevState: AuthActionResult | null,
    formData: FormData
): Promise<AuthActionResult> {
    const rawData = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    };

    const validatedData = signupSchema.safeParse(rawData);

    if (!validatedData.success) {
        return {
            error: validatedData.error.issues[0]?.message || "Invalid input",
        };
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(
            clientAuth,
            validatedData.data.email,
            validatedData.data.password
        );

        await updateProfile(userCredential.user, {
            displayName: validatedData.data.name,
        });

        // We don't automatically sign in on signup to force email verification if needed,
        // but here we'll just return success so the user can log in.
        return {
            success: true,
        };
    } catch (error: any) {
        return {
            error: error.message || "Failed to create account",
        };
    }
}

// OAuth flows are usually better handled on the client in Firebase to get the token,
// then calling a server action to set the session.
// However, for consistency with the previous Supabase implementation,
// we'll keep the signatures but they might need client-side help.

export async function handleOAuthSignIn(idToken: string) {
    await createSession(idToken);
    redirect("/dashboard");
}

export async function signOut() {
    await removeSession();
    await firebaseSignOut(clientAuth);
    redirect("/");
}

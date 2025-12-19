"use server";

import { stripe } from "@/lib/stripe";
import { getSession } from "@/lib/firebase/server";
import { redirect } from "next/navigation";

export async function createCheckoutSession(priceId: string) {
    const session = await getSession();

    if (!session) {
        redirect("/login?error=unauthorized");
    }

    const userEmail = session.email;
    // In a real app, we'd fetch the customerId from their user profile in Firestore
    // For now, let's create a checkout session using their email

    const checkoutSession = await stripe.checkout.sessions.create({
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        mode: "subscription",
        customer_email: userEmail,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout_success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        metadata: {
            userId: session.uid
        }
    });

    if (!checkoutSession.url) {
        throw new Error("Failed to create checkout session");
    }

    redirect(checkoutSession.url);
}

export async function createPortalSession() {
    const session = await getSession();

    if (!session) {
        redirect("/login?error=unauthorized");
    }

    // This would require the stripeCustomerId from Firestore
    // For this prototype, we'll implement this after user document migration
}

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getAdminDb } from "@/lib/firebase/admin";
import Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

interface SubscriptionFields {
    customer: string;
    status: string;
    current_period_end: number;
    items?: {
        data: Array<{ plan?: { nickname?: string | null } | null }>;
    };
}

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    try {
        if (!signature || !endpointSecret) {
            throw new Error("Missing stripe signature or endpoint secret");
        }
        event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error(`Webhook Error: ${message}`);
        return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
    }

    const db = getAdminDb();
    if (!db) {
        return new NextResponse("Firestore not initialized", { status: 500 });
    }

    // Handle relevant event types
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId;
            const subscriptionId = session.subscription as string;
            const customerId = session.customer as string;

            if (userId && subscriptionId) {
                // Fields changed across Stripe API versions, so map the ones we use explicitly.
                const subscription = (await stripe.subscriptions.retrieve(
                    subscriptionId
                )) as unknown as SubscriptionFields;

                await db.collection("users").doc(userId).update({
                    stripeCustomerId: customerId,
                    stripeSubscriptionId: subscriptionId,
                    plan: subscription.items?.data[0]?.plan?.nickname || "Starter",
                    status: subscription.status,
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    updatedAt: new Date(),
                });
            }
            break;
        }

        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
            const subscription = event.data.object as unknown as SubscriptionFields;
            const customerId = subscription.customer;

            // Find user by customerId
            const userQuery = await db.collection("users").where("stripeCustomerId", "==", customerId).limit(1).get();

            if (!userQuery.empty) {
                const userId = userQuery.docs[0].id;
                await db.collection("users").doc(userId).update({
                    status: subscription.status,
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    updatedAt: new Date(),
                });
            }
            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}

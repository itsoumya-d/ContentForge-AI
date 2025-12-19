import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getAdminDb } from "@/lib/firebase/admin";
import Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    try {
        if (!signature || !endpointSecret) {
            throw new Error("Missing stripe signature or endpoint secret");
        }
        event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
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
                // Cast to any to access properties that might have changed in latest SDK
                const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any;

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
            const subscription = event.data.object as any;
            const customerId = subscription.customer as string;

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

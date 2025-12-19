import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-01-27.ac" as any,
        typescript: true,
    })
    : (null as unknown as Stripe);

export const getStripeSession = async (priceId: string, customerId?: string, userEmail?: string) => {
    if (!stripe) {
        throw new Error("Stripe is not initialized. Check your STRIPE_SECRET_KEY.");
    }

    return stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : userEmail,
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        mode: "subscription",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        subscription_data: {
            metadata: {
                // Will be used by webhooks
            },
        },
    });
};

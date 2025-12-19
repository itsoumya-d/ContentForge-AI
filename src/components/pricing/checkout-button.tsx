"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/lib/actions/payments";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CheckoutButtonProps {
    priceId: string | undefined;
    text: string;
    variant?: any;
    className?: string;
}

export function CheckoutButton({ priceId, text, variant, className }: CheckoutButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleCheckout = () => {
        if (!priceId) {
            toast.info("This is the free plan. You're already on it!");
            return;
        }

        startTransition(async () => {
            try {
                await createCheckoutSession(priceId);
            } catch (error) {
                console.error("Checkout error:", error);
                toast.error("Failed to start checkout. Please try again.");
            }
        });
    };

    return (
        <Button
            variant={variant}
            className={className}
            disabled={isPending}
            onClick={handleCheckout}
        >
            {isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparing...
                </>
            ) : (
                text
            )}
        </Button>
    );
}

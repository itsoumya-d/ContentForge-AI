import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/components/pricing/checkout-button";

type PricingTier = {
    name: string;
    price: string;
    priceId: string | undefined;
    description: string;
    features: string[];
    buttonText: string;
    buttonVariant: "outline" | "default" | "indigo";
    popular?: boolean;
};

const tiers: PricingTier[] = [
    {
        name: "Free",
        price: "$0",
        priceId: undefined,
        description: "Perfect for exploring the power of ContentForge AI.",
        features: [
            "5 Documents per month",
            "Gemini 1.5 Flash analysis",
            "Basic chat interface",
            "Standard support",
        ],
        buttonText: "Current Plan",
        buttonVariant: "outline",
    },
    {
        name: "Starter",
        price: "$19",
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
        description: "Ideal for freelancers and content creators.",
        features: [
            "50 Documents per month",
            "Fast Gemini 1.5 Flash",
            "Multimodal analysis (Images/PDF)",
            "Basic content transforms",
            "Email support",
        ],
        buttonText: "Upgrade to Starter",
        buttonVariant: "default",
        popular: true,
    },
    {
        name: "Pro",
        price: "$49",
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
        description: "For teams and serious power users.",
        features: [
            "Unlimited Documents",
            "Gemini 1.5 Pro (High precision)",
            "Batch transformation",
            "Custom brand voice",
            "Priority priority support",
            "Early access to new features",
        ],
        buttonText: "Go Pro",
        buttonVariant: "indigo",
    },
];

export default function PricingPage() {
    return (
        <div className="container relative py-20 lg:py-32 overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="flex flex-col items-center text-center space-y-4 mb-16">
                <Badge variant="outline" className="px-4 py-1 text-indigo-600 border-indigo-200 bg-indigo-50">
                    Pricing Plans
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                    Transform Your Content <br />
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Without Breaking the Bank
                    </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                    Choose the plan that fits your workflow. All plans include 256-bit encryption and top-tier data privacy.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {tiers.map((tier) => (
                    <Card
                        key={tier.name}
                        className={`relative flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-indigo-500/10 ${tier.popular ? "border-indigo-500 shadow-xl shadow-indigo-500/10" : ""
                            }`}
                    >
                        {tier.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                                MOST POPULAR
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="text-2xl">{tier.name}</CardTitle>
                            <CardDescription>{tier.description}</CardDescription>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-bold">{tier.price}</span>
                                <span className="ml-1 text-muted-foreground">/month</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm">
                                        <div className="mt-1 bg-emerald-500/10 rounded-full p-0.5 shrink-0">
                                            <Check className="h-3 w-3 text-emerald-600" />
                                        </div>
                                        <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <CheckoutButton
                                priceId={tier.priceId}
                                text={tier.buttonText}
                                variant={tier.buttonVariant === "indigo" ? "default" : tier.buttonVariant}
                                className={`w-full h-12 text-sm font-semibold rounded-xl ${tier.buttonVariant === "indigo" ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20" : ""
                                    }`}
                            />
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="mt-20 text-center">
                <p className="text-muted-foreground">
                    Need a custom plan for your organization? <Link href="/contact" className="text-indigo-600 font-semibold hover:underline">Contact Sales</Link>
                </p>
            </div>
        </div>
    );
}

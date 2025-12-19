"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const MarketingNav = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
                scrolled
                    ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-zinc-200 dark:border-zinc-800 py-3"
                    : "bg-transparent border-transparent py-5"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-6 transition-transform">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden sm:block">
                            Content<span className="text-indigo-600">Forge</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors">
                            Features
                        </Link>
                        <Link href="#pricing" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors">
                            Pricing
                        </Link>
                        <Link href="#faq" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors">
                            FAQ
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium hover:text-indigo-600 transition-colors">
                            Login
                        </Link>
                        <Button size="sm" asChild className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
                            <Link href="/signup">Get Started</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

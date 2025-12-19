"use client";

import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Upload,
    MessageSquare,
    Wand2,
    ArrowRight,
    Settings,
    ShieldCheck
} from "lucide-react";

const actions = [
    {
        title: "Upload Document",
        description: "Analyze and chat with new files",
        icon: Upload,
        href: "/dashboard/documents/upload",
        color: "from-blue-500 to-cyan-500",
        shadow: "shadow-blue-500/10",
    },
    {
        title: "Batch Transform",
        description: "Repurpose multiple docs at once",
        icon: Wand2,
        href: "/dashboard/transform",
        color: "from-indigo-500 to-purple-500",
        shadow: "shadow-indigo-500/10",
    },
    {
        title: "Workspace Chat",
        description: "Talk to all your documents",
        icon: MessageSquare,
        href: "/dashboard/chat",
        color: "from-pink-500 to-rose-500",
        shadow: "shadow-pink-500/10",
    },
];

export function QuickActions() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Quick Actions</h2>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    Pro Workspace Active
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {actions.map((action) => (
                    <Link key={action.title} href={action.href}>
                        <Card className={`group h-full cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border-indigo-500/10 ${action.shadow}`}>
                            <CardHeader>
                                <div
                                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} shadow-lg shadow-black/5`}
                                >
                                    <action.icon className="h-6 w-6 text-white" />
                                </div>
                                <CardTitle className="flex items-center justify-between text-base">
                                    {action.title}
                                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                                </CardTitle>
                                <CardDescription className="text-sm line-clamp-1">{action.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}

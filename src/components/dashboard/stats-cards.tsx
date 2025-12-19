"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    FileText,
    Wand2,
    MessageSquare,
    TrendingUp,
    Database
} from "lucide-react";
import { DocumentMetadata } from "@/lib/actions/documents";
import { UserSubscription } from "@/lib/actions/user";

interface StatsCardsProps {
    documents: (DocumentMetadata & { id: string })[];
    subscription: UserSubscription;
}

export function StatsCards({ documents, subscription }: StatsCardsProps) {
    const totalDocs = documents.length;
    const totalSize = documents.reduce((acc, doc) => acc + doc.size, 0);
    const sizeInMb = (totalSize / (1024 * 1024)).toFixed(2);
    const storageLimitMb = (subscription.storageLimit / (1024 * 1024)).toFixed(0);

    // Mocks for now, will be connected in Phase 2/3
    const transforms = documents.filter(d => d.summary).length;

    const stats = [
        {
            title: "Documents",
            value: `${totalDocs} / ${subscription.documentLimit === 1000000 ? "∞" : subscription.documentLimit}`,
            description: `Plan: ${subscription.plan}`,
            icon: FileText,
            color: "text-blue-500",
        },
        {
            title: "Storage Used",
            value: `${sizeInMb} MB`,
            description: `Of ${storageLimitMb} MB limit`,
            icon: Database,
            color: "text-cyan-500",
        },
        {
            title: "AI Transforms",
            value: transforms,
            description: "Summaries generated",
            icon: Wand2,
            color: "text-purple-500",
        },
        {
            title: "Plan Status",
            value: subscription.plan,
            description: subscription.status === "active" ? "Subscription active" : "Free trial",
            icon: TrendingUp,
            color: "text-indigo-500",
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.title} className="overflow-hidden border-indigo-500/10 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                        </CardTitle>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

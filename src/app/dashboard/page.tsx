import {
    StatsCards,
    QuickActions,
    DocumentListClient
} from "@/components/dashboard";
import { getUserDocuments } from "@/lib/actions/documents";
import { getUserSubscription } from "@/lib/actions/user";

export default async function DashboardPage() {
    const documents = await getUserDocuments();
    const subscription = await getUserSubscription();

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header section with context */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
                <p className="text-muted-foreground">
                    You&apos;re currently on the <span className="text-indigo-600 font-semibold">{subscription.plan} plan</span>.
                </p>
            </div>

            {/* Top Grid: Primary Stats */}
            <StatsCards documents={documents} subscription={subscription} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Content Area: Document Management */}
                <div className="lg:col-span-8">
                    <DocumentListClient initialDocuments={documents} />
                </div>

                {/* Sidebar Area: Quick Tools & Tips */}
                <div className="lg:col-span-4 space-y-10">
                    <QuickActions />

                    {/* Pro Tip Highlight */}
                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                            <TrendingUp className="h-20 w-20 text-indigo-500" />
                        </div>
                        <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Pro Tip</h3>
                        <p className="text-sm text-indigo-700/70 dark:text-indigo-400/70 leading-relaxed">
                            Upload your documents in <span className="font-bold">PDF</span> format for the best Gemini analysis results.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Re-using TrendingUp icon in the tip box
import { TrendingUp } from "lucide-react";

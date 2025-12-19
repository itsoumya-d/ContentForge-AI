"use client";

import { useEffect, useState } from "react";
import { ChatInterface } from "@/components/dashboard/chat-interface";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Calendar,
    Database,
    ChevronLeft,
    Share2,
    Download,
    MoreVertical,
    Bot,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { DocumentMetadata } from "@/lib/actions/documents";
import { createChatSession, getChatHistory, Message } from "@/lib/actions/chat";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DocumentDetailProps {
    document: DocumentMetadata & { id: string };
    initialChatId?: string;
}

export default function DocumentDetail({ document, initialChatId }: DocumentDetailProps) {
    const [chatId, setChatId] = useState<string | null>(initialChatId || null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isInitializing, setIsInitializing] = useState(!initialChatId);

    useEffect(() => {
        async function initChat() {
            if (!chatId) {
                const id = await createChatSession(document.id);
                setChatId(id);
            } else {
                const history = await getChatHistory(document.id, chatId);
                setMessages(history);
            }
            setIsInitializing(false);
        }
        initChat();
    }, [document.id, chatId]);

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 h-full flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">{document.name}</h1>
                            <Badge variant="secondary" className="uppercase text-[10px]">
                                {document.type.split("/")[1] || document.type}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(document.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Database className="h-3.5 w-3.5" />
                                {(document.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Share2 className="h-4 w-4" /> Share
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" /> Download
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
                {/* Document Preview & Info */}
                <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2">
                    <div className="rounded-2xl border bg-card p-8 min-h-[400px]">
                        <div className="flex items-center gap-3 mb-6">
                            <FileText className="h-6 w-6 text-indigo-500" />
                            <h2 className="text-xl font-semibold">Document Summary</h2>
                        </div>

                        {document.status === "processing" ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                                <p className="text-muted-foreground italic">Analyzing content with Gemini...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <p className="text-lg leading-relaxed text-foreground/90">
                                    {document.summary || "No summary available for this document."}
                                </p>

                                {document.tags && document.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {document.tags.map(tag => (
                                            <Badge key={tag} variant="outline" className="bg-muted/50">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                <Separator />

                                <div className="grid gap-4">
                                    <h3 className="font-medium">Quick Insights</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border bg-muted/10 space-y-1">
                                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Tone</p>
                                            <p className="text-sm font-medium">Professional & Informative</p>
                                        </div>
                                        <div className="p-4 rounded-xl border bg-muted/10 space-y-1">
                                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Sentiment</p>
                                            <p className="text-sm font-medium">Positive</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Interface */}
                <div className="flex flex-col h-[600px] lg:h-full lg:sticky lg:top-8">
                    {isInitializing || !chatId ? (
                        <div className="flex flex-col items-center justify-center h-full border rounded-2xl bg-muted/10">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                            <p className="text-xs text-muted-foreground mt-4">Initializing chat...</p>
                        </div>
                    ) : (
                        <ChatInterface
                            documentId={document.id}
                            chatId={chatId}
                            initialMessages={messages}
                            context={document.summary}
                            className="h-full border-indigo-500/20 shadow-indigo-500/5 shadow-2xl"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

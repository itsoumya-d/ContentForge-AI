"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Send,
    Bot,
    User,
    Loader2,
    Trash2,
    Maximize2,
    Minimize2,
    Sparkles,
    Copy,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { saveMessage, getChatHistory, Message } from "@/lib/actions/chat";

interface ChatInterfaceProps {
    documentId: string;
    chatId: string;
    initialMessages?: Message[];
    context?: string;
    className?: string;
}

const CopyButton = ({ content }: { content: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute -right-8 top-0"
            onClick={handleCopy}
        >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
    );
};

export function ChatInterface({
    documentId,
    chatId,
    initialMessages = [],
    context,
    className
}: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");

        // Add user message locally
        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: userMessage,
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setIsLoading(true);

        try {
            // Save user message to Firestore
            await saveMessage(documentId, chatId, "user", userMessage);

            // Call streaming API
            const response = await fetch("/api/chat", {
                method: "POST",
                body: JSON.stringify({
                    documentId,
                    chatId,
                    message: userMessage,
                    history: messages.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
                    context
                }),
            });

            if (!response.ok) throw new Error("Failed to get response");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let aiResponseContent = "";

            // Initialize AI message
            const aiMsgId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, {
                id: aiMsgId,
                role: "model",
                content: "",
                createdAt: new Date().toISOString()
            }]);

            while (true) {
                const { done, value } = await reader!.read();
                if (done) break;

                const chunk = decoder.decode(value);
                aiResponseContent += chunk;

                setMessages(prev => prev.map(m =>
                    m.id === aiMsgId ? { ...m, content: aiResponseContent } : m
                ));
            }

            // Save complete AI response
            await saveMessage(documentId, chatId, "model", aiResponseContent);
        } catch (error) {
            console.error("Chat error:", error);
            // Add error message?
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn(
            "flex flex-col bg-card border rounded-2xl shadow-xl transition-all duration-300 overflow-hidden",
            isMinimized ? "h-14" : "h-[600px]",
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-500 rounded-lg p-1">
                        <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">Gemini Assistant</h3>
                        <p className="text-[10px] text-muted-foreground leading-none">Powered by Pro</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setIsMinimized(!isMinimized)}
                    >
                        {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
                        <div className="space-y-4">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                    <div className="bg-indigo-500/10 p-4 rounded-full">
                                        <Sparkles className="h-8 w-8 text-indigo-500" />
                                    </div>
                                    <div className="max-w-[200px]">
                                        <p className="text-sm font-medium">Hello! How can I help with this document?</p>
                                        <p className="text-xs text-muted-foreground mt-1">Ask for a summary, key points, or specific questions.</p>
                                    </div>
                                </div>
                            )}

                            <AnimatePresence initial={false}>
                                {messages.map((m) => (
                                    <motion.div
                                        key={m.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex gap-3 max-w-[85%]",
                                            m.role === "user" ? "ml-auto flex-row-reverse" : ""
                                        )}
                                    >
                                        <div className={cn(
                                            "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border shadow-sm",
                                            m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                        )}>
                                            {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                        </div>
                                        <div className={cn(
                                            "rounded-2xl px-4 py-2.5 text-sm shadow-sm relative group/msg",
                                            m.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted/50 text-foreground"
                                        )}>
                                            <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {m.content}
                                                </ReactMarkdown>
                                            </div>
                                            <CopyButton content={m.content} />
                                        </div>

                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {isLoading && messages[messages.length - 1]?.role !== "model" && (
                                <div className="flex gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-muted">
                                        <Bot className="h-4 w-4 animate-pulse" />
                                    </div>
                                    <div className="bg-muted/50 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Thinking...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input */}
                    <form
                        onSubmit={handleSend}
                        className="p-4 border-t bg-muted/10"
                    >
                        <div className="relative group">
                            <input
                                className="w-full bg-background border rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-muted-foreground"
                                placeholder="Ask a question..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="absolute right-1.5 top-1.5 h-8 w-8 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
                                disabled={!input.trim() || isLoading}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-center text-muted-foreground mt-2">
                            Gemini can make mistakes. Verify important info.
                        </p>
                    </form>
                </>
            )}
        </div>
    );
}

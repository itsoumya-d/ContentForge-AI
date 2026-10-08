"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Send,
    Bot,
    User,
    Loader2,
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
import { saveMessage, Message } from "@/lib/actions/chat";
import { readTextStream } from "@/lib/chat/read-text-stream";

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

type ChatMessage = Message & { incomplete?: boolean };

type PendingTurn = {
    user: Message;
    assistantId: string;
    history: Message[];
    userSaved: boolean;
    completedText?: string;
};

export function ChatInterface(props: ChatInterfaceProps) {
    // A new document/chat must not inherit messages or an in-flight request.
    return <ChatSession key={`${props.documentId}:${props.chatId}`} {...props} />;
}

function ChatSession({
    documentId,
    chatId,
    initialMessages = [],
    context,
    className
}: ChatInterfaceProps) {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<AbortController | null>(null);
    const pendingTurnRef = useRef<PendingTurn | null>(null);
    const excludedHistoryIds = useRef(new Set<string>());
    const [error, setError] = useState<string | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);

    useEffect(() => () => {
        const request = requestRef.current;
        requestRef.current = null;
        request?.abort();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const runTurn = async (turn: PendingTurn) => {
        // Ref ownership closes the same-tick window before React disables Submit.
        if (requestRef.current) return;
        const request = new AbortController();
        requestRef.current = request;
        const isCurrent = () => requestRef.current === request;
        setIsLoading(true);
        setError(null);

        try {
            if (!turn.userSaved) {
                await saveMessage(documentId, chatId, "user", turn.user.content);
                turn.userSaved = true;
            }
            request.signal.throwIfAborted();

            if (turn.completedText === undefined) {
                setIsStreaming(true);
                setMessages(prev => prev.filter(m => m.id !== turn.assistantId));
                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    signal: request.signal,
                    body: JSON.stringify({
                        documentId,
                        chatId,
                        message: turn.user.content,
                        history: turn.history.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
                        context
                    }),
                });

                turn.completedText = await readTextStream(response, request.signal, text => {
                    if (!isCurrent() || request.signal.aborted) return;
                    setMessages(prev => {
                        const reply: ChatMessage = {
                            id: turn.assistantId,
                            role: "model",
                            content: text,
                            createdAt: new Date().toISOString()
                        };
                        return prev.some(m => m.id === turn.assistantId)
                            ? prev.map(m => m.id === turn.assistantId ? reply : m)
                            : [...prev, reply];
                    });
                });
            }

            request.signal.throwIfAborted();
            if (isCurrent()) setIsStreaming(false);
            // Only a fully received reply is persisted. A save retry reuses this text.
            await saveMessage(documentId, chatId, "model", turn.completedText);
            if (isCurrent() && !request.signal.aborted) {
                excludedHistoryIds.current.delete(turn.user.id);
                excludedHistoryIds.current.delete(turn.assistantId);
                pendingTurnRef.current = null;
            }
        } catch {
            if (!isCurrent()) return;
            excludedHistoryIds.current.add(turn.user.id);
            excludedHistoryIds.current.add(turn.assistantId);
            setMessages(prev => prev.map(m => m.id === turn.assistantId
                ? { ...m, incomplete: turn.completedText === undefined }
                : m));
            setError(turn.completedText !== undefined
                ? "The reply is shown, but could not be saved. Retry to save it."
                : request.signal.aborted
                    ? "Response stopped. You can retry your question."
                    : "We couldn't finish the response. Please retry your question.");
        } finally {
            if (isCurrent()) {
                requestRef.current = null;
                setIsLoading(false);
                setIsStreaming(false);
            }
        }
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || requestRef.current || pendingTurnRef.current) return;
        const turn: PendingTurn = {
            user: {
                id: crypto.randomUUID(),
                role: "user",
                content: input.trim(),
                createdAt: new Date().toISOString()
            },
            assistantId: crypto.randomUUID(),
            history: messages.filter(m => !excludedHistoryIds.current.has(m.id)),
            userSaved: false
        };
        pendingTurnRef.current = turn;
        setInput("");
        setMessages(prev => [...prev, turn.user]);
        void runTurn(turn);
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
                        aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
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
                                            {m.incomplete && (
                                                <p className="mt-2 text-xs text-muted-foreground">Incomplete response</p>
                                            )}
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

                    {error && (
                        <div className="px-4 py-3 border-t space-y-2">
                            <p role="alert" className="text-sm text-destructive">{error}</p>
                            <div className="flex gap-2">
                                <Button type="button" size="sm" onClick={() => {
                                    const turn = pendingTurnRef.current;
                                    if (turn) void runTurn(turn);
                                }}>Retry</Button>
                                <Button type="button" size="sm" variant="outline" onClick={() => {
                                    pendingTurnRef.current = null;
                                    setError(null);
                                }}>Ask a different question</Button>
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <form
                        onSubmit={handleSend}
                        className="p-4 border-t bg-muted/10"
                    >
                        <div className="relative group">
                            <input
                                className="w-full bg-background border rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-muted-foreground"
                                aria-label="Ask a question"
                                placeholder="Ask a question..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading || !!error}
                            />
                            <Button
                                aria-label="Send message"
                                type="submit"
                                size="icon"
                                className="absolute right-1.5 top-1.5 h-8 w-8 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
                                disabled={!input.trim() || isLoading || !!error}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                        {isStreaming && (
                            <Button type="button" variant="outline" size="sm" className="mt-2"
                                onClick={() => requestRef.current?.abort()}>
                                Stop response
                            </Button>
                        )}
                        <p className="text-[10px] text-center text-muted-foreground mt-2">
                            Gemini can make mistakes. Verify important info.
                        </p>
                    </form>
                </>
            )}
        </div>
    );
}

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Check, Copy, Linkedin, Instagram, Twitter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ContentPreviewProps {
    twitter?: string[];
    linkedin?: string;
    instagram?: string;
}

const PLATFORM_LIMITS = {
    twitter: 280,
    linkedin: 3000,
    instagram: 2200
};

function CharacterCounter({ current, limit, label }: { current: number; limit: number; label: string }) {
    const isOver = current > limit;
    return (
        <div className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${isOver ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            }`}>
            {label}: {current} / {limit}
        </div>
    );
}

export function ContentPreview({ twitter, linkedin, instagram }: ContentPreviewProps) {
    const [activeTab, setActiveTab] = useState("all");

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    if (!twitter && !linkedin && !instagram) return null;

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">Generated Content</h3>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All View</TabsTrigger>
                    {twitter && <TabsTrigger value="twitter">X / Twitter</TabsTrigger>}
                    {linkedin && <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>}
                    {instagram && <TabsTrigger value="instagram">Instagram</TabsTrigger>}
                </TabsList>

                <TabsContent value="all" className="mt-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {twitter && (
                            <Card className="h-full">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Twitter className="h-4 w-4 text-sky-500" /> Twitter Thread ({twitter.length})
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(twitter.join("\n\n"))}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                        {twitter.map((tweet, i) => (
                                            <div key={i} className="p-3 bg-muted/50 rounded-lg text-sm border border-border/50">
                                                <div className="flex justify-between items-center mb-1">
                                                    <div className="text-xs text-muted-foreground">Tweet {i + 1}/{twitter.length}</div>
                                                    <CharacterCounter current={tweet.length} limit={PLATFORM_LIMITS.twitter} label="Chars" />
                                                </div>
                                                {tweet}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {linkedin && (
                            <Card className="h-full">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Linkedin className="h-4 w-4 text-blue-600" /> LinkedIn Post
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <CharacterCounter current={linkedin.length} limit={PLATFORM_LIMITS.linkedin} label="Post" />
                                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(linkedin)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        readOnly
                                        value={linkedin}
                                        className="min-h-[300px] resize-none border-0 bg-muted/30 focus-visible:ring-0 text-sm"
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {instagram && (
                            <Card className="h-full md:col-span-2 lg:col-span-1">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Instagram className="h-4 w-4 text-pink-600" /> Instagram Caption
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <CharacterCounter current={instagram.length} limit={PLATFORM_LIMITS.instagram} label="Caption" />
                                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(instagram)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        readOnly
                                        value={instagram}
                                        className="min-h-[300px] resize-none border-0 bg-muted/30 focus-visible:ring-0 text-sm"
                                    />
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* Individual Tab Contents for Detail View */}
                {twitter && (
                    <TabsContent value="twitter">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Twitter Thread Preview</CardTitle>
                                    <Button onClick={() => copyToClipboard(twitter.join("\n\n"))} size="sm">
                                        <Copy className="h-4 w-4 mr-2" /> Copy Thread
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {twitter.map((tweet, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 p-4 rounded-xl border border-border bg-card">
                                            <p className="whitespace-pre-wrap text-sm">{tweet}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {/* LinkedIn and Instagram individual tabs follow similar simple pattern if needed, but 'All' view is usually sufficient */}
            </Tabs>
        </div>
    );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateSocialContent, TransformResult } from "@/lib/actions/transform";
import { ContentPreview } from "@/components/transform/content-preview";
import { Loader2, Sparkles, Twitter, Linkedin, Instagram } from "lucide-react";
import { toast } from "sonner";

export default function TransformPage() {
    const [sourceText, setSourceText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<TransformResult | null>(null);

    // Configuration
    const [platforms, setPlatforms] = useState({
        twitter: true,
        linkedin: true,
        instagram: false
    });
    const [tone, setTone] = useState("Professional");

    const handleGenerate = async () => {
        if (!sourceText.trim()) {
            toast.error("Please enter some content to transform.");
            return;
        }
        if (!Object.values(platforms).some(Boolean)) {
            toast.error("Please select at least one platform.");
            return;
        }

        setIsGenerating(true);
        setResult(null);

        try {
            const data = await generateSocialContent(sourceText, platforms, tone);
            if (data.error) {
                toast.error(data.error);
            } else {
                setResult(data);
                toast.success("Content generated successfully!");
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Content Transformation</h2>
                    <p className="text-muted-foreground">
                        Turn your blog posts, notes, or documents into optimized social media content in seconds.
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Input and Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Input Content</CardTitle>
                            <CardDescription>Paste your source text here.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="Paste your article, blog post, or notes..."
                                className="min-h-[300px] resize-none"
                                value={sourceText}
                                onChange={(e) => setSourceText(e.target.value)}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <Label>Select Platforms</Label>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="twitter"
                                            checked={platforms.twitter}
                                            onCheckedChange={(c) => setPlatforms(prev => ({ ...prev, twitter: !!c }))}
                                        />
                                        <Label htmlFor="twitter" className="flex items-center gap-2 cursor-pointer font-normal">
                                            <Twitter className="h-4 w-4 text-sky-500" /> Twitter Thread
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="linkedin"
                                            checked={platforms.linkedin}
                                            onCheckedChange={(c) => setPlatforms(prev => ({ ...prev, linkedin: !!c }))}
                                        />
                                        <Label htmlFor="linkedin" className="flex items-center gap-2 cursor-pointer font-normal">
                                            <Linkedin className="h-4 w-4 text-blue-600" /> LinkedIn Post
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="instagram"
                                            checked={platforms.instagram}
                                            onCheckedChange={(c) => setPlatforms(prev => ({ ...prev, instagram: !!c }))}
                                        />
                                        <Label htmlFor="instagram" className="flex items-center gap-2 cursor-pointer font-normal">
                                            <Instagram className="h-4 w-4 text-pink-600" /> Instagram Caption
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Select Tone</Label>
                                <Select value={tone} onValueChange={setTone}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Professional">Professional & Authoritative</SelectItem>
                                        <SelectItem value="Casual">Casual & Friendly</SelectItem>
                                        <SelectItem value="Viral">Viral & Hook-heavy</SelectItem>
                                        <SelectItem value="Educational">Educational & Detailed</SelectItem>
                                        <SelectItem value="Witty">Witty & Humorous</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleGenerate}
                                disabled={isGenerating || !sourceText}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" /> Generate Content
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Output Preview */}
                <div className="lg:col-span-2">
                    {result ? (
                        <ContentPreview
                            twitter={result.twitter}
                            linkedin={result.linkedin}
                            instagram={result.instagram}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/20 text-muted-foreground">
                            <div className="p-4 bg-muted rounded-full mb-4">
                                <Sparkles className="h-8 w-8 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Ready to Transform</h3>
                            <p className="text-center max-w-sm">
                                Enter your content on the left, choose your platforms, and let Gemini magic handle the rest.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

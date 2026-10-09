"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateSocialContent, TransformResult, TransformPlatform } from "@/lib/actions/transform";
import { ContentPreview } from "@/components/transform/content-preview";
import { Loader2, Sparkles, Twitter, Linkedin, Instagram } from "lucide-react";
import { toast } from "sonner";

export default function TransformPage() {
    const requestPending = useRef(false);
    const resultContext = useRef<{ source: string; tone: string } | null>(null);
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
        if (requestPending.current) return;
        if (!sourceText.trim()) {
            toast.error("Please enter some content to transform.");
            return;
        }
        if (!Object.values(platforms).some(Boolean)) {
            toast.error("Please select at least one platform.");
            return;
        }

        requestPending.current = true;
        setIsGenerating(true);
        const prior = resultContext.current?.source === sourceText && resultContext.current?.tone === tone ? result : null;
        if (!prior) setResult(null);

        try {
            const data = await generateSocialContent(sourceText, platforms, tone);
            const next: TransformResult = { ...data };
            const errors = { ...data.errors };
            for (const platform of ["twitter", "linkedin", "instagram"] as TransformPlatform[]) {
                if (!platforms[platform]) {
                    if (platform === "twitter") next.twitter = prior?.twitter;
                    else next[platform] = prior?.[platform];
                    if (prior?.errors?.[platform]) errors[platform] = prior.errors[platform];
                } else if (data.error && !errors[platform]) {
                    errors[platform] = data.error;
                }
            }
            next.errors = Object.keys(errors).length ? errors : undefined;
            if (next.twitter || next.linkedin || next.instagram) next.error = undefined;
            resultContext.current = { source: sourceText, tone };
            setResult(next);
            if (next.error) {
                toast.error(next.error);
            } else if (next.errors) {
                toast.warning("Some platforms could not be generated. Available results are shown below.");
            } else {
                toast.success("Content generated successfully!");
            }
        } catch (error) {
            setResult({ ...prior, error: "Could not generate content. Please try again." });
            toast.error("Could not generate content. Please try again.");
            console.error(error);
        } finally {
            requestPending.current = false;
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
                                disabled={isGenerating}
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
                                            disabled={isGenerating}
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
                                            disabled={isGenerating}
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
                                            disabled={isGenerating}
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
                                <Select value={tone} onValueChange={setTone} disabled={isGenerating}>
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
                        <div className="space-y-4">
                            {(result.error || (result.errors && Object.keys(result.errors).length > 0)) && (
                                <div role="alert" className="rounded-lg border border-destructive/40 p-4 text-sm">
                                    <p>{result.error || "Some platforms could not be generated. Your available results are preserved below."}</p>
                                    {result.errors && (
                                        <ul className="mt-2 list-disc pl-5">
                                            {Object.entries(result.errors).map(([platform, message]) => (
                                                <li key={platform}>
                                                    {{ twitter: "X / Twitter", linkedin: "LinkedIn", instagram: "Instagram" }[platform]}: {message}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <p className="mt-2">Select the platforms you want to retry, then choose Generate Content.</p>
                                </div>
                            )}
                            <ContentPreview
                                key={[!!result.twitter, !!result.linkedin, !!result.instagram].join(":")}
                                twitter={result.twitter}
                                linkedin={result.linkedin}
                                instagram={result.instagram}
                            />
                        </div>
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

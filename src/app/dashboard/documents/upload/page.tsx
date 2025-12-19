import { UploadZone } from "@/components/dashboard/upload-zone";
import { Sparkles } from "lucide-react";

export default function UploadPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Upload Documents</h1>
                <p className="text-muted-foreground">
                    Upload your files to start transforming them with AI. We support various formats including PDFs, Word docs, images, and media.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2">
                    <UploadZone />
                </div>

                <div className="space-y-6">
                    <div className="rounded-2xl border bg-card p-6 space-y-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                            <Sparkles className="h-5 w-5 text-indigo-500" />
                        </div>
                        <h2 className="font-semibold">What happens next?</h2>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex gap-2">
                                <span className="text-indigo-500 font-bold">•</span>
                                Files are securely uploaded to Firebase Storage.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-indigo-500 font-bold">•</span>
                                Gemini AI analyzes the content and extracts key metadata.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-indigo-500 font-bold">•</span>
                                Documents become searchable and ready for chat.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-indigo-500 font-bold">•</span>
                                Text is automatically transcribed for media files.
                            </li>
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">
                        <h3 className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Pro Tip</h3>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            For the best results, ensure your PDFs are text-based rather than scanned images. Scanned docs will still work but might take longer to process.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

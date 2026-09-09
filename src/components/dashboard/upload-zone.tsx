"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
    Upload,
    File,
    X,
    CheckCircle2,
    AlertCircle,
    FileText,
    Image as ImageIcon,
    Video,
    Music,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { storage, auth as clientAuth } from "@/lib/firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { registerDocument } from "@/lib/actions/documents";
import { onAuthStateChanged } from "firebase/auth";

interface FileWithStatus {
    file: File;
    progress: number;
    status: "idle" | "uploading" | "completed" | "error";
    error?: string;
    preview?: string;
}

export function UploadZone() {
    const [files, setFiles] = useState<FileWithStatus[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map(file => ({
            file,
            progress: 0,
            status: "idle" as const,
            preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined
        }));
        setFiles(prev => [...prev, ...newFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
            "image/*": [".png", ".jpg", ".jpeg", ".webp"],
            "video/*": [".mp4", ".mov"],
            "audio/*": [".mp3", ".wav"],
            "text/plain": [".txt"]
        }
    });

    const removeFile = (index: number) => {
        setFiles(prev => {
            const newFiles = [...prev];
            if (newFiles[index].preview) {
                URL.revokeObjectURL(newFiles[index].preview!);
            }
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
        if (type.startsWith("video/")) return <Video className="h-4 w-4" />;
        if (type.startsWith("audio/")) return <Music className="h-4 w-4" />;
        if (type === "application/pdf") return <FileText className="h-4 w-4" />;
        return <File className="h-4 w-4" />;
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        const user = clientAuth.currentUser;
        if (!user) {
            toast.error("You must be logged in to upload files.");
            return;
        }

        const uploadPromises = files.map(async (fileItem, index) => {
            if (fileItem.status === "completed") return;

            const file = fileItem.file;
            const storagePath = `users/${user.uid}/documents/${Date.now()}-${file.name}`;
            const storageRef = ref(storage, storagePath);
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise<void>((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                        setFiles((prev) => {
                            const next = [...prev];
                            next[index] = { ...next[index], progress, status: "uploading" };
                            return next;
                        });
                    },
                    (error) => {
                        setFiles((prev) => {
                            const next = [...prev];
                            next[index] = { ...next[index], status: "error", error: error.message };
                            return next;
                        });
                        reject(error);
                    },
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                        try {
                            await registerDocument({
                                name: file.name,
                                type: file.type,
                                size: file.size,
                                url: downloadURL,
                                storagePath: storagePath,
                            });

                            setFiles((prev) => {
                                const next = [...prev];
                                next[index] = { ...next[index], status: "completed", progress: 100 };
                                return next;
                            });
                            resolve();
                        } catch (err) {
                            setFiles((prev) => {
                                const next = [...prev];
                                next[index] = { ...next[index], status: "error", error: err instanceof Error ? err.message : "Upload failed" };
                                return next;
                            });
                            reject(err);
                        }
                    }
                );
            });
        });

        try {
            await Promise.all(uploadPromises);
            toast.success("All files uploaded and registered successfully!");
        } catch (error) {
            toast.error("Some files failed to upload.");
        }
    };

    const isUploading = files.some(f => f.status === "uploading");

    return (
        <div className="space-y-6">
            <div
                {...getRootProps()}
                className={cn(
                    "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all cursor-pointer",
                    isDragActive
                        ? "border-indigo-500 bg-indigo-500/5 ring-4 ring-indigo-500/10"
                        : "border-muted-foreground/20 hover:border-indigo-500/50 hover:bg-muted/50"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 mb-4">
                    <Upload className={cn("h-8 w-8 text-indigo-500 transition-transform", isDragActive && "animate-bounce")} />
                </div>
                <div className="text-center">
                    <p className="text-lg font-medium">
                        {isDragActive ? "Drop the files here" : "Click or drag files to upload"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Support for PDF, Word, Images, Audio, and Video (max 50MB)
                    </p>
                </div>
            </div>

            {files.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Queue ({files.length})
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFiles([])}
                            className="h-8 text-xs hover:text-destructive"
                        >
                            Clear all
                        </Button>
                    </div>

                    <div className="grid gap-3">
                        {files.map((item, index) => (
                            <div
                                key={`${item.file.name}-${index}`}
                                className="group relative flex items-center gap-4 rounded-xl border bg-card p-3 transition-colors hover:bg-muted/30"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    {getFileIcon(item.file.type)}
                                </div>

                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="truncate text-sm font-medium">
                                            {item.file.name}
                                        </p>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {item.status === "uploading" ? (
                                        <div className="space-y-1.5">
                                            <Progress value={item.progress} className="h-1" />
                                            <p className="text-[10px] text-muted-foreground">
                                                {item.progress}% • Uploading...
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">
                                            {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    )}
                                </div>

                                {item.status === "completed" && (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                )}
                                {item.status === "error" && (
                                    <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>

                    <Button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="w-full h-11 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing uploads...
                            </>
                        ) : (
                            "Start analysis"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}

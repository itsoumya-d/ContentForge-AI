"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Clock,
    Search,
    ArrowRight,
    Filter,
    MoreVertical,
    FileIcon,
    SearchX
} from "lucide-react";
import { DocumentMetadata } from "@/lib/actions/documents";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface DocumentListProps {
    initialDocuments: (DocumentMetadata & { id: string })[];
}

export function DocumentListClient({ initialDocuments }: DocumentListProps) {
    const [search, setSearch] = useState("");

    const filteredDocuments = initialDocuments.filter(doc =>
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.type.toLowerCase().includes(search.toLowerCase()) ||
        (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
    );

    const recentDocuments = filteredDocuments.slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <h2 className="text-xl font-semibold">Recent Documents</h2>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search documents..."
                            className="pl-9 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-indigo-500/30"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="shrink-0 border-indigo-500/10">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card className="border-indigo-500/10 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                    {recentDocuments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="bg-muted p-4 rounded-full">
                                <SearchX className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-semibold text-lg">No documents found</p>
                                <p className="text-sm text-muted-foreground">Try adjusting your search or upload a new file.</p>
                            </div>
                            <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700" size="sm" asChild>
                                <Link href="/dashboard/documents/upload">Upload File</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-indigo-500/5">
                            {recentDocuments.map((doc) => (
                                <Link
                                    key={doc.id}
                                    href={`/dashboard/documents/${doc.id}`}
                                    className="flex items-center gap-4 p-4 transition-all hover:bg-muted/50 group"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                        <FileIcon className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate font-semibold group-hover:text-indigo-600 transition-colors">
                                            {doc.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge variant="outline" className="text-[10px] uppercase h-4 py-0 font-bold tracking-tight">
                                                {doc.type.split("/")[1] || doc.type}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(doc.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2">
                                        {doc.tags?.slice(0, 2).map((tag) => (
                                            <Badge key={tag} variant="secondary" className="bg-muted text-[10px] font-medium">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {filteredDocuments.length > 5 && (
                <div className="flex justify-center">
                    <Button variant="ghost" className="text-muted-foreground hover:text-indigo-600" asChild>
                        <Link href="/dashboard/documents" className="flex items-center gap-2">
                            View all {filteredDocuments.length} documents
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}

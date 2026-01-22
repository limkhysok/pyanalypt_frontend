"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
    onUploadSuccess: () => void;
}

export function UploadZone({ onUploadSuccess }: UploadZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setError(null);
            setSuccess(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setSuccess(false);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setProgress(0);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("session_id", crypto.randomUUID());

        try {
            // simulate progress
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return prev;
                    return prev + 10;
                });
            }, 100);

            const response = await fetch("http://localhost:8000/api/upload/", {
                method: "POST",
                body: formData,
            });

            clearInterval(interval);

            if (!response.ok) {
                throw new Error("Upload failed. Please check the backend connection.");
            }

            // const data = await response.json(); // Not used currently
            setProgress(100);
            setSuccess(true);
            setTimeout(() => {
                onUploadSuccess();
            }, 1000);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full flex flex-col gap-6">
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer overflow-hidden",
                    isDragOver
                        ? "border-primary bg-primary/10 scale-[1.02]"
                        : "border-muted-foreground/20 hover:border-primary/50 hover:bg-white/5",
                    file && !error && !success ? "border-primary/50" : ""
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".csv,.xlsx,.json"
                />

                <div className="z-10 flex flex-col items-center gap-3">
                    <div className={cn("p-4 rounded-full bg-background transition-all duration-500",
                        success ? "text-green-500" : "text-primary",
                        (uploading || isDragOver) && "scale-110 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    )}>
                        {success ? <CheckCircle size={32} /> : uploading ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold tracking-tight">
                            {file ? file.name : "Drop file or Click to Upload"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {file ? `${(file.size / 1024).toFixed(1)} KB` : "CSV, Excel, or JSON (Max 50MB)"}
                        </p>
                    </div>
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
            </div>

            {(file || uploading || error || success) && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {uploading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Uploading & Analyzing...</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    )}

                    {error && (
                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {!uploading && !success && (
                        <Button onClick={handleUpload} className="w-full h-12 text-base font-medium shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all">
                            Analyze Data
                        </Button>
                    )}

                    {success && (
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-center font-medium">
                            Analysis Complete! Redirecting...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

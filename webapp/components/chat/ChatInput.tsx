"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Paperclip, X, Image as ImageIcon, Sparkles, ChevronDown } from "lucide-react";
import { useChatStore } from "@/lib/chat-store";
import { useAIStore, AIProvider } from "@/lib/ai/ai-store";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PROVIDER_LABELS: Record<AIProvider, string> = {
    gemini: "Gemini",
    openai: "GPT-4",
    anthropic: "Claude",
    deepseek: "DeepSeek",
    llama: "Llama",
    kimi: "Kimi",
};

export function ChatInput({ isFloating = false }: { isFloating?: boolean }) {
    const { input, setInput, submitQuery, isLoading, attachments, addAttachment, removeAttachment } = useChatStore();
    const { provider, setProvider } = useAIStore();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!input.trim() || isLoading) return;
            submitQuery(input);
        }
    };

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    addAttachment({
                        id: Math.random().toString(36),
                        type: 'image',
                        url: e.target?.result as string,
                        name: file.name,
                    });
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    return (
        <div className={cn(
            "w-full max-w-3xl mx-auto transition-all duration-300",
            isFloating ? "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4" : "relative"
        )}>
            {/* Attachment Previews */}
            {attachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                    {attachments.map((attachment) => (
                        <div key={attachment.id} className="relative group">
                            <img
                                src={attachment.url}
                                alt={attachment.name}
                                className="h-20 w-20 object-cover rounded-lg border border-border"
                            />
                            <button
                                onClick={() => removeAttachment(attachment.id)}
                                className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-3 w-3" />
                            </button>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <span className="text-white text-[10px] px-2 truncate max-w-full">{attachment.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div
                className={cn(
                    "relative flex items-end gap-2 p-2 rounded-2xl border transition-all duration-300 bg-background/80 backdrop-blur-xl shadow-2xl",
                    isFocused ? "border-primary/50 ring-1 ring-primary/20" : "border-border",
                    isDragging && "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5",
                    isFloating && "shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                {/* Provider Selector */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-1.5 h-10 px-3 rounded-xl hover:bg-muted text-muted-foreground transition-colors shrink-0 mb-0.5 group">
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            <span className="text-xs font-medium">{PROVIDER_LABELS[provider]}</span>
                            <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                        {Object.entries(PROVIDER_LABELS).map(([key, label]) => (
                            <DropdownMenuItem
                                key={key}
                                onClick={() => setProvider(key as AIProvider)}
                                className={cn(
                                    "cursor-pointer",
                                    provider === key && "bg-accent"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {provider === key && <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                                    <span>{label}</span>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* File Upload Button */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center h-10 w-10 rounded-xl hover:bg-muted text-muted-foreground transition-colors shrink-0 mb-0.5 group"
                    title="Upload images"
                >
                    <ImageIcon className="h-5 w-5 group-hover:text-amber-500 transition-colors" />
                </button>

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Ask about your PnL, Win Rate, or upload a chart for analysis..."
                    className="w-full bg-transparent border-none outline-none focus:ring-0 resize-none min-h-[44px] max-h-[200px] py-3 text-base text-foreground placeholder:text-muted-foreground scrollbar-hide leading-relaxed"
                    rows={1}
                />

                {/* Send Button */}
                <button
                    onClick={() => !isLoading && input.trim() && submitQuery(input)}
                    disabled={!input.trim() || isLoading}
                    className={cn(
                        "flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-200 shrink-0 mb-0.5",
                        input.trim() && !isLoading
                            ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:opacity-90 shadow-md transform hover:scale-105"
                            : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                    )}
                >
                    {isLoading ? (
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <ArrowUp className="h-5 w-5" />
                    )}
                </button>
            </div>

            {/* Helper text */}
            {(isFocused || input.length > 0 || attachments.length > 0) && (
                <div className="absolute -bottom-6 left-0 right-0 text-center">
                    <span className="text-[10px] text-muted-foreground font-medium animate-fade-in">
                        {attachments.length > 0
                            ? `${attachments.length} image(s) attached • AI will analyze with ${PROVIDER_LABELS[provider]}`
                            : `Powered by ${PROVIDER_LABELS[provider]} • Drag & drop images to analyze`
                        }
                    </span>
                </div>
            )}

            {/* Drag overlay */}
            {isDragging && (
                <div className="absolute inset-0 bg-amber-500/10 border-2 border-dashed border-amber-500 rounded-2xl flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <ImageIcon className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-amber-500">Drop images to analyze</p>
                    </div>
                </div>
            )}
        </div>
    );
}

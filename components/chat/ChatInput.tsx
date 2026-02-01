"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Paperclip, X } from "lucide-react";
import { useChatStore } from "@/lib/chat-store";
import { cn } from "@/lib/utils";

export function ChatInput({ isFloating = false }: { isFloating?: boolean }) {
    const { input, setInput, submitQuery, isLoading } = useChatStore();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isFocused, setIsFocused] = useState(false);

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

    return (
        <div className={cn(
            "w-full max-w-3xl mx-auto transition-all duration-300",
            isFloating ? "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4" : "relative"
        )}>
            <div className={cn(
                "relative flex items-end gap-2 p-2 rounded-2xl border transition-all duration-300 bg-background/80 backdrop-blur-xl shadow-2xl",
                isFocused ? "border-primary/50 ring-1 ring-primary/20" : "border-border",
                isFloating && "shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
            )}>
                {/* File Upload Button */}
                <button className="flex items-center justify-center h-10 w-10 rounded-xl hover:bg-muted text-muted-foreground transition-colors shrink-0 mb-0.5">
                    <Paperclip className="h-5 w-5" />
                </button>

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Ask about your PnL, Win Rate, or Market Trends..."
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
                            ? "bg-primary text-primary-foreground hover:opacity-90 shadow-md transform hover:scale-105"
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

            {/* Helper text only when focused or typing */}
            {(isFocused || input.length > 0) && (
                <div className="absolute -bottom-6 left-0 right-0 text-center">
                    <span className="text-[10px] text-muted-foreground font-medium animate-fade-in">
                        AI can update charts and analyze live data.
                    </span>
                </div>
            )}
        </div>
    );
}

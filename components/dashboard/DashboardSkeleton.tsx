"use client";

import { useEffect, useState } from "react";
import { getRandomQuote } from "@/lib/quotes";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
    const [quote, setQuote] = useState<{ text: string, author: string } | null>(null);

    useEffect(() => {
        setQuote(getRandomQuote());
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden flex flex-col items-center pt-8 md:pt-12">

            {/* Background Effects (Matching Dashboard) */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-dot-grid opacity-30"></div>
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden dark:block">
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[80%] rounded-full bg-amber-500/5 blur-[150px]"></div>
            </div>

            {/* Main Container - 80% on Desktop */}
            <div className="w-full max-w-[90%] md:max-w-[80%] lg:max-w-[1200px] z-10 flex flex-col gap-8 animate-pulse-subtle">

                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48 bg-muted/40" />
                        <Skeleton className="h-4 w-64 bg-muted/20" />
                    </div>
                    <div className="flex gap-3">
                        <Skeleton className="h-9 w-36 bg-muted/30 rounded-lg" />
                    </div>
                </div>

                {/* Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 rounded-2xl bg-card/40 border border-white/5 p-5 flex flex-col justify-between">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-20 bg-muted/30" />
                                <Skeleton className="h-6 w-6 rounded-full bg-muted/20" />
                            </div>
                            <Skeleton className="h-8 w-32 bg-muted/40" />
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                    {/* Chart Area */}
                    <div className="lg:col-span-2 rounded-2xl bg-card/30 border border-white/5 p-6 flex flex-col gap-4">
                        <div className="flex justify-between items-center mb-4">
                            <Skeleton className="h-6 w-32 bg-muted/30" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-16 bg-muted/20 rounded-md" />
                                <Skeleton className="h-8 w-16 bg-muted/20 rounded-md" />
                            </div>
                        </div>
                        <Skeleton className="flex-1 w-full bg-muted/10 rounded-lg" />
                    </div>

                    {/* Side Widget */}
                    <div className="rounded-2xl bg-card/30 border border-white/5 p-6 flex flex-col gap-4">
                        <Skeleton className="h-6 w-24 bg-muted/30" />
                        <Skeleton className="flex-1 w-full bg-muted/10 rounded-lg" />
                    </div>
                </div>

            </div>

            {/* Footer / Quote - Bottom Right */}
            <div className="fixed bottom-8 right-8 z-20 text-right max-w-sm animate-fade-in-up">
                {quote && (
                    <div className="space-y-2">
                        <p className="text-lg md:text-xl font-medium text-muted-foreground/80 italic leading-snug">
                            &ldquo;{quote.text}&rdquo;
                        </p>
                        <p className="text-sm text-amber-500/80 font-semibold tracking-wide uppercase">
                            — {quote.author}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

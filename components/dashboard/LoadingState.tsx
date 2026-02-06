"use client";

import { Loader2 } from "lucide-react";

export function LoadingState() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-8">
            <div className="text-center space-y-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                    <div className="relative">
                        <Loader2 className="h-16 w-16 text-amber-500 animate-spin mx-auto" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">Loading Your Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                        Fetching your trading data from Deriverse...
                    </p>
                </div>
            </div>
        </div>
    );
}

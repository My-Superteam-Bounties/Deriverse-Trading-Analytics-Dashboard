"use client";

import { useWalletStore } from "@/lib/wallet-store";
import { useDeriverse } from "@/hooks/useDeriverse";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, Loader2, AlertCircle, TrendingUp } from "lucide-react";
import { useEffect } from "react";

interface WalletGuardProps {
    children: React.ReactNode;
}

export function WalletGuard({ children }: WalletGuardProps) {
    const { isConnected } = useWalletStore();
    const { isInitialized, isInitializing, error, initialize } = useDeriverse();

    // Auto-initialization is now handled internally by useDeriverse hook

    // Not connected state
    if (!isConnected) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full p-8 card-gradient text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-full bg-amber-500/10">
                            <Wallet className="h-12 w-12 text-amber-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Connect Your Wallet</h2>
                    <p className="text-muted-foreground mb-6">
                        Connect your wallet to view your trading analytics and performance metrics from Deriverse.
                    </p>
                    <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-amber-500" />
                            <span>Real-time PnL tracking</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-amber-500" />
                            <span>Position monitoring</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-amber-500" />
                            <span>Trade history analysis</span>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // Initializing state
    if (isInitializing) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full p-8 card-gradient text-center">
                    <div className="flex justify-center mb-6">
                        <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Connecting to Deriverse</h2>
                    <p className="text-muted-foreground">
                        Initializing SDK and fetching your trading data...
                    </p>
                </Card>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full p-8 card-gradient text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-full bg-red-500/10">
                            <AlertCircle className="h-12 w-12 text-red-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Connection Error</h2>
                    <p className="text-muted-foreground mb-6">{error instanceof Error ? error.message : String(error)}</p>
                    <Button
                        onClick={() => initialize()}
                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
                    >
                        Retry Connection
                    </Button>
                </Card>
            </div>
        );
    }

    // Success - show children
    if (isInitialized) {
        return <>{children}</>;
    }

    // Fallback
    return null;
}

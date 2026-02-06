"use client";

import { useDeriverse } from "@/hooks/useDeriverse";
import { useWalletStore } from "@/lib/wallet-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export function DeriverseStatus() {
    const { isConnected } = useWalletStore();
    const { client, isInitialized, isInitializing, error, initialize } = useDeriverse();

    if (!isConnected) {
        return (
            <Card className="p-6 card-gradient">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm">Connect your wallet to access Deriverse trading</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 card-gradient">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Deriverse SDK Status</h3>
                    {isInitialized && (
                        <div className="flex items-center gap-2 text-green-500">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Connected</span>
                        </div>
                    )}
                </div>

                {isInitializing && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <p className="text-sm">Initializing Deriverse Engine...</p>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-3 text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {!isInitialized && !isInitializing && (
                    <Button
                        onClick={initialize}
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
                    >
                        Initialize Deriverse
                    </Button>
                )}

                {isInitialized && client && (
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b border-border/50">
                            <span className="text-muted-foreground">Status</span>
                            <span className="text-foreground font-medium">Ready</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border/50">
                            <span className="text-muted-foreground">Network</span>
                            <span className="text-foreground font-medium">Devnet</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                            Deriverse SDK is initialized and ready for trading operations.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}

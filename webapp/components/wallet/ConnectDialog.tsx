"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWalletStore, WalletType } from "@/lib/wallet-store";
import { Wallet, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ConnectDialog({ isOpen, onOpenChange }: ConnectDialogProps) {
    const { connect, isConnecting } = useWalletStore();

    const handleConnect = async (type: WalletType) => {
        await connect(type);
        onOpenChange(false);
    };

    const WALLETS = [
        { id: 'metamask', name: 'MetaMask', icon: '🦊', color: 'bg-orange-500/10 text-orange-500' },
        { id: 'phantom', name: 'Phantom', icon: '👻', color: 'bg-purple-500/10 text-purple-500' },
        { id: 'rabby', name: 'Rabby', icon: '🐰', color: 'bg-blue-500/10 text-blue-500' },
        { id: 'walletconnect', name: 'WalletConnect', icon: '🔗', color: 'bg-cyan-500/10 text-cyan-500' },
    ] as const;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] border-border bg-card/95 backdrop-blur-xl p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Wallet className="h-5 w-5" />
                        </div>
                        Connect Wallet
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 pt-2 grid gap-3">
                    {WALLETS.map((wallet) => (
                        <button
                            key={wallet.id}
                            disabled={isConnecting}
                            onClick={() => handleConnect(wallet.id as WalletType)}
                            className={cn(
                                "flex items-center justify-between w-full p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted transition-all group",
                                isConnecting && "opacity-50 cursor-wait"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-xl", wallet.color)}>
                                    {wallet.icon}
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {wallet.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {wallet.id === 'phantom' ? 'Solana' : 'EVM & Others'}
                                    </p>
                                </div>
                            </div>
                            {isConnecting ? (
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            ) : (
                                <div className="h-2 w-2 rounded-full bg-border group-hover:bg-primary transition-colors"></div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-4 bg-muted/20 border-t border-border text-center">
                    <p className="text-xs text-muted-foreground">
                        By connecting, you agree to our <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

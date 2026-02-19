"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
    Wallet,
    Copy,
    ExternalLink,
    LogOut,
    Check,
    RefreshCw,
} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useWalletStore } from "@/lib/wallet-store";
import { cn } from "@/lib/utils";
import { CustomWalletModal } from "./CustomWalletModal";
import { toast } from "sonner";
import { DERIVERSE_CONFIG } from "@/lib/deriverse/config";

export function WalletProfilePopover() {
    const { publicKey, disconnect: disconnectWallet } = useWallet();
    const { isConnected, address, disconnect } = useWalletStore();
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Real balance state
    const [solBalance, setSolBalance] = useState<number | null>(null);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);

    // Fetch real SOL balance
    const fetchBalance = async () => {
        if (!publicKey) return;

        setIsLoadingBalance(true);
        try {
            const connection = new Connection(DERIVERSE_CONFIG.rpcUrl, "confirmed");
            const lamports = await connection.getBalance(publicKey);
            setSolBalance(lamports / LAMPORTS_PER_SOL);
        } catch (err) {
            console.error("[Wallet] Failed to fetch balance:", err);
            setSolBalance(null);
        } finally {
            setIsLoadingBalance(false);
        }
    };

    // Auto-fetch on open and when wallet connects
    useEffect(() => {
        if (isOpen && publicKey) {
            fetchBalance();
        }
    }, [isOpen, publicKey]);

    // If not connected, just show the connect modal trigger
    if (!isConnected) {
        return <CustomWalletModal />;
    }

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            toast.success("Address copied!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const truncatedAddress = address
        ? `${address.slice(0, 4)}...${address.slice(-4)}`
        : "";

    const formatSol = (sol: number) => {
        if (sol >= 1000) return sol.toLocaleString(undefined, { maximumFractionDigits: 2 });
        if (sol >= 1) return sol.toFixed(4);
        return sol.toFixed(6);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "flex items-center gap-2 pl-1 pr-1 lg:pr-3 py-1 rounded-full",
                        "bg-primary/10 hover:bg-primary/20 border border-primary/20",
                        "transition-all duration-200 group"
                    )}
                >
                    <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                        <Wallet className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-medium text-primary group-hover:text-primary transition-colors hidden lg:inline-block">
                        {truncatedAddress}
                    </span>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0 rounded-xl border border-border bg-card shadow-xl backdrop-blur-xl mr-4" align="end">
                {/* Identity Header */}
                <div className="p-4 flex items-center gap-3 border-b border-border/50">
                    <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-primary ring-2 ring-primary/20">
                        <Wallet className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">Solana Wallet</p>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground font-mono">{truncatedAddress}</span>
                            <button
                                onClick={copyAddress}
                                className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                                title="Copy address"
                            >
                                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                            </button>
                            <a
                                href={`https://solscan.io/account/${address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                                title="View on Solscan"
                            >
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Balance */}
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Balance</span>
                        <button
                            onClick={fetchBalance}
                            disabled={isLoadingBalance}
                            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                            title="Refresh balance"
                        >
                            <RefreshCw className={cn("h-3 w-3", isLoadingBalance && "animate-spin")} />
                        </button>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                        <div className="flex items-center gap-3">
                            {/* SOL Icon */}
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-black text-white">SOL</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">Solana</p>
                                {isLoadingBalance ? (
                                    <div className="h-5 w-20 bg-muted rounded animate-pulse mt-0.5" />
                                ) : solBalance !== null ? (
                                    <p className="text-sm font-bold text-foreground tabular-nums">
                                        {formatSol(solBalance)} <span className="text-muted-foreground font-medium">SOL</span>
                                    </p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">Unable to fetch</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="p-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10 h-9 text-sm"
                        onClick={async () => {
                            try {
                                await disconnectWallet();
                                disconnect();
                                setIsOpen(false);
                                toast.success("Wallet Disconnected", {
                                    description: "Your wallet has been safely disconnected.",
                                });
                            } catch (error) {
                                console.error("Disconnect error:", error);
                                toast.error("Disconnect Failed", {
                                    description: "There was an error disconnecting your wallet. Please try again.",
                                });
                            }
                        }}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Disconnect Wallet
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

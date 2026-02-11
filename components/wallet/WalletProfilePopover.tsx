"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
    Wallet,
    Copy,
    ExternalLink,
    LogOut,
    Check,
    CreditCard,
    ShieldCheck
} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useWalletStore } from "@/lib/wallet-store";
import { cn } from "@/lib/utils";
import { CustomWalletModal } from "./CustomWalletModal";
import { toast } from "sonner";

export function WalletProfilePopover() {
    const { disconnect: disconnectWallet } = useWallet(); // Solana wallet adapter disconnect
    const { isConnected, address, walletType, balance, disconnect } = useWalletStore();
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // If not connected, just show the connect modal trigger
    if (!isConnected) {
        return <CustomWalletModal />;
    }

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const truncatedAddress = address
        ? `${address.slice(0, 4)}...${address.slice(-4)}`
        : "";

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "flex items-center gap-2 pl-1 pr-3 py-1 rounded-full",
                        "bg-primary/10 hover:bg-primary/20 border border-primary/20",
                        "transition-all duration-200 group"
                    )}
                >
                    <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                        <Wallet className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-medium text-primary group-hover:text-primary transition-colors">
                        {truncatedAddress}
                    </span>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 rounded-xl border border-border bg-card shadow-xl backdrop-blur-xl mr-4" align="end">
                {/* Header / Identity */}
                <div className="p-5 flex flex-col items-center border-b border-border/50 bg-muted/20">
                    <div className="h-16 w-16 mb-3 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-lg ring-4 ring-background">
                        <Wallet className="h-8 w-8" />
                    </div>
                    <h4 className="text-lg font-bold text-foreground">Solana Wallet</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-md">
                            {truncatedAddress}
                        </span>
                        <button
                            onClick={copyAddress}
                            className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                            title="Copy Address"
                        >
                            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        <a
                            href={`https://solscan.io/account/${address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                            title="View on Solscan"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </div>
                </div>

                {/* Balance Section */}
                <div className="p-5 space-y-4">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Balance</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-foreground">
                                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-sm text-muted-foreground">USD</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-indigo-400">SOL</span>
                                </div>
                                <span className="text-xs font-medium text-foreground">Solana</span>
                            </div>
                            <p className="text-sm font-bold">
                                {(balance / 145).toFixed(2)} SOL
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-blue-400">USDC</span>
                                </div>
                                <span className="text-xs font-medium text-foreground">USDC</span>
                            </div>
                            <p className="text-sm font-bold">
                                0.00 USDC
                            </p>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="p-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10 h-10"
                        onClick={async () => {
                            try {
                                // Disconnect from Solana wallet adapter
                                await disconnectWallet();
                                // Clear Zustand store
                                disconnect();
                                // Close popover
                                setIsOpen(false);
                                // Show success toast
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

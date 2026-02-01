"use client";

import React, { useState } from "react";
import { useWalletStore } from "@/lib/wallet-store";
import { ConnectDialog } from "./ConnectDialog";
import { Wallet, ChevronDown, LogOut, Copy, Check, ExternalLink } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export function WalletButton() {
    const { isConnected, address, balance, chainId, disconnect } = useWalletStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const truncateAddress = (addr: string) => {
        if (!addr) return "";
        return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    };

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isConnected && address) {
        return (
            <>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg border border-border bg-card hover:bg-muted/50 text-xs font-medium transition-all group backdrop-blur-sm">
                            <div className="flex flex-col items-end mr-2">
                                <span className="text-foreground font-bold">{balance}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{chainId}</span>
                            </div>
                            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted text-foreground font-mono">
                                {truncateAddress(address)}
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            </div>
                            <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl bg-card/95 backdrop-blur-xl border-border">
                        <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
                            {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                            Copy Address
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Explorer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={disconnect} className="text-red-500 hover:text-red-600 focus:text-red-600 cursor-pointer">
                            <LogOut className="h-4 w-4 mr-2" />
                            Disconnect
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold uppercase tracking-wide shadow-lg shadow-amber-900/20 hover:shadow-amber-900/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
                <Wallet className="h-3 w-3" />
                <span>Connect Wallet</span>
            </button>

            <ConnectDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </>
    );
}

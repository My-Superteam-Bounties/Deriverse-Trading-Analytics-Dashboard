"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletName } from "@solana/wallet-adapter-base";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wallet, ExternalLink, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWalletStore } from "@/lib/wallet-store";

interface WalletOption {
    name: string;
    icon: string;
    adapter: WalletName;
    installUrl: string;
    checkInstalled: () => boolean;
}

const SUPPORTED_WALLETS: WalletOption[] = [
    {
        name: "Phantom",
        icon: "https://phantom.app/img/phantom-logo.svg",
        adapter: "Phantom" as WalletName,
        installUrl: "https://phantom.app/download",
        checkInstalled: () => typeof window !== "undefined" && "phantom" in window && window.phantom?.solana?.isPhantom === true,
    },
    {
        name: "Solflare",
        icon: "https://solflare.com/favicon.ico",
        adapter: "Solflare" as WalletName,
        installUrl: "https://solflare.com/download",
        checkInstalled: () => typeof window !== "undefined" && "solflare" in window,
    },
];

interface CustomWalletModalProps {
    className?: string;
    children?: React.ReactNode;
}

export function CustomWalletModal({ className, children }: CustomWalletModalProps) {
    const [open, setOpen] = useState(false);
    const [isConnectingTo, setIsConnectingTo] = useState<string | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [installedWallets, setInstalledWallets] = useState<Set<string>>(new Set());

    const { select, connect, connected, disconnect, publicKey, wallet } = useWallet();
    const { setWalletState } = useWalletStore();

    // Pending wallet selection for robust connection flow
    const [pendingWalletName, setPendingWalletName] = useState<WalletName | null>(null);

    // Sync wallet adapter state with our store
    useEffect(() => {
        if (connected && publicKey && wallet) {
            setWalletState({
                isConnected: true,
                address: publicKey.toBase58(),
                walletType: wallet.adapter.name,
                balance: 0,
            });
        } else {
            setWalletState({
                isConnected: false,
                address: null,
                walletType: null,
                balance: 0,
            });
        }
    }, [connected, publicKey, wallet, setWalletState]);

    // Check installed wallets
    useEffect(() => {
        if (typeof window === "undefined") return;
        const checkWallets = () => {
            const installed = new Set<string>();
            SUPPORTED_WALLETS.forEach((w) => {
                if (w.checkInstalled()) installed.add(w.name);
            });
            setInstalledWallets(installed);
        };
        checkWallets();
        const timeout = setTimeout(checkWallets, 1000);
        return () => clearTimeout(timeout);
    }, []);

    // Handle robust connection: Wait for wallet to be selected, then connect
    useEffect(() => {
        if (pendingWalletName && wallet && wallet.adapter.name === pendingWalletName) {
            const attemptConnect = async () => {
                try {
                    // Slight delay to ensure adapter is ready (crucial for some adapters)
                    await new Promise(r => setTimeout(r, 100));
                    await connect();
                    setOpen(false);
                    setPendingWalletName(null);
                    setIsConnectingTo(null);
                } catch (err: any) {
                    console.error("Connection error:", err);
                    let msg = "Failed to connect.";
                    if (err?.message?.includes("User rejected")) msg = "Connection rejected.";
                    else if (err?.message?.includes("WalletNotReadyError")) msg = "Wallet not ready. Please unlock.";
                    else msg = err?.message || msg;

                    setConnectionError(msg);
                    setPendingWalletName(null);
                    setIsConnectingTo(null);
                }
            };
            attemptConnect();
        }
    }, [pendingWalletName, wallet, connect]);

    const handleSelectWallet = (walletName: WalletName, walletOption: WalletOption) => {
        setConnectionError(null);
        if (!walletOption.checkInstalled()) {
            setConnectionError(`${walletOption.name} is not installed.`);
            return;
        }

        setIsConnectingTo(walletName);
        select(walletName); // Triggers update to 'wallet' object
        setPendingWalletName(walletName); // Signals effect to connect when ready
    };

    const handleDisconnect = async () => {
        try { await disconnect(); } catch (err) { console.error(err); }
    };

    if (connected && publicKey) {
        return (
            <button
                onClick={handleDisconnect}
                className={cn(
                    "flex items-center gap-2 px-4 h-10 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-lg text-sm font-medium transition-all shadow-lg",
                    className
                )}
            >
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">
                    {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                </span>
                <span className="sm:hidden">Connected</span>
            </button>
        );
    }

    return (
        <>
            <button
                onClick={() => { setOpen(true); setConnectionError(null); }}
                className={cn(
                    "flex items-center gap-2 px-4 h-10 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-lg text-sm font-medium transition-all shadow-lg",
                    className
                )}
            >
                {children || (
                    <>
                        <Wallet className="h-4 w-4" />
                        Connect Wallet
                    </>
                )}
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md bg-gradient-to-b from-zinc-950 to-zinc-900 border-amber-500/20">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                            Connect Wallet
                        </DialogTitle>
                        <div className="sr-only"> {/* Screen reader only description */}
                            Select a wallet to connect to Deriverse Analytics.
                        </div>
                    </DialogHeader>

                    {connectionError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-400 flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>{connectionError}</span>
                            </p>
                        </div>
                    )}

                    <div className="space-y-3 mt-4">
                        {SUPPORTED_WALLETS.map((walletOption) => {
                            const installed = installedWallets.has(walletOption.name);
                            const isConnecting = isConnectingTo === walletOption.adapter;

                            return (
                                <div key={walletOption.name}>
                                    {installed ? (
                                        <button
                                            onClick={() => handleSelectWallet(walletOption.adapter, walletOption)}
                                            disabled={isConnecting}
                                            className={cn(
                                                "w-full flex items-center gap-4 p-4 rounded-xl border transition-all",
                                                "bg-white/5 border-white/10 hover:bg-amber-500/10 hover:border-amber-500/30",
                                                "disabled:opacity-50 disabled:cursor-not-allowed"
                                            )}
                                        >
                                            <img src={walletOption.icon} alt={walletOption.name} className="w-10 h-10 rounded-lg" />
                                            <div className="flex-1 text-left">
                                                <p className="font-medium text-white">{walletOption.name}</p>
                                                {isConnecting && (
                                                    <p className="text-xs text-green-400 flex items-center gap-1 animate-pulse">
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                        Requesting connection...
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    ) : (
                                        <a
                                            href={walletOption.installUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center gap-4 p-4 rounded-xl border transition-all bg-white/5 border-white/10 opacity-60 hover:opacity-100"
                                        >
                                            <img src={walletOption.icon} alt={walletOption.name} className="w-10 h-10 rounded-lg grayscale" />
                                            <div className="flex-1 text-left">
                                                <p className="font-medium text-white/70">{walletOption.name}</p>
                                                <p className="text-xs text-amber-400">Install Wallet</p>
                                            </div>
                                            <ExternalLink className="h-4 w-4 text-white/50" />
                                        </a>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

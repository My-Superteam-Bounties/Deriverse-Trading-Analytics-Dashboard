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
        icon: "/phantom.png",
        adapter: "Phantom" as WalletName,
        installUrl: "https://phantom.app/download",
        checkInstalled: () => typeof window !== "undefined" && "phantom" in window && window.phantom?.solana?.isPhantom === true,
    },
    {
        name: "Solflare",
        icon: "/solflare.png",
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
                    "flex items-center gap-2 px-4 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-all shadow-lg shadow-primary/20",
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
                    "flex items-center gap-2 px-4 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-all shadow-lg shadow-primary/20",
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
                <DialogContent className="sm:max-w-md bg-card border-primary/20">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-primary">
                            Connect Wallet
                        </DialogTitle>
                        <div className="sr-only"> {/* Screen reader only description */}
                            Select a wallet to connect to Deriverse Analytics.
                        </div>
                    </DialogHeader>

                    {connectionError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-500 flex items-start gap-2">
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
                                                "bg-muted/50 border-border hover:bg-primary/10 hover:border-primary/30",
                                                "disabled:opacity-50 disabled:cursor-not-allowed"
                                            )}
                                        >
                                            <img
                                                src={walletOption.icon}
                                                alt={walletOption.name}
                                                className="w-10 h-10 rounded-lg"
                                                onError={(e) => {
                                                    // Fallback to a generic wallet icon if image fails to load
                                                    e.currentTarget.style.display = 'none';
                                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                            />
                                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-lg hidden shadow-lg">
                                                {walletOption.name[0]}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-medium text-foreground">{walletOption.name}</p>
                                                {isConnecting && (
                                                    <p className="text-xs text-primary flex items-center gap-1 animate-pulse">
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
                                            className="w-full flex items-center gap-4 p-4 rounded-xl border transition-all bg-muted/30 border-border opacity-60 hover:opacity-100"
                                        >
                                            <img
                                                src={walletOption.icon}
                                                alt={walletOption.name}
                                                className="w-10 h-10 rounded-lg grayscale"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                            />
                                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold text-lg hidden grayscale">
                                                {walletOption.name[0]}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-medium text-muted-foreground">{walletOption.name}</p>
                                                <p className="text-xs text-primary">Install Wallet</p>
                                            </div>
                                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
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

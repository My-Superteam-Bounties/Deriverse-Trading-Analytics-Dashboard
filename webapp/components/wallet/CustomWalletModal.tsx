"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletName } from "@solana/wallet-adapter-base";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wallet, ExternalLink, AlertCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWalletStore } from "@/lib/wallet-store";
import { Button } from "@/components/ui/button";

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
    const [installedWallets, setInstalledWallets] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const [isConnectingTo, setIsConnectingTo] = useState<string | null>(null);

    const { wallets, select, connect, connected, connecting, disconnecting, disconnect, publicKey, wallet } = useWallet();
    const { setWalletState } = useWalletStore();

    // Sync store
    useEffect(() => {
        setWalletState({
            isConnected: !!connected && !!publicKey,
            address: publicKey?.toBase58() || null,
            walletType: wallet?.adapter.name || null,
            balance: 0,
        });

        if (connected) {
            setOpen(false);
            setIsConnectingTo(null);
        }
    }, [connected, publicKey, wallet, setWalletState]);

    // Check installed wallets
    useEffect(() => {
        if (typeof window === "undefined") return;
        const check = () => {
            const installed = new Set<string>();
            SUPPORTED_WALLETS.forEach((w) => {
                if (w.checkInstalled()) installed.add(w.name);
            });
            setInstalledWallets(installed);
        };
        check();
        const t = setInterval(check, 1000);
        return () => clearInterval(t);
    }, []);

    const [connectionTimeout, setConnectionTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleConnect = useCallback(async (walletName: WalletName) => {
        setError(null);
        setIsConnectingTo(walletName);

        try {
            const selectedWallet = wallets.find(w => w.adapter.name === walletName);
            if (!selectedWallet) throw new Error("Wallet adapter not found");

            const isAlreadySelected = wallet?.adapter.name === walletName;

            if (!isAlreadySelected) {
                // Let autoConnect handle it after selection
                select(walletName);

                // Add a timeout to reset the spinner if autoConnect fails silently or user ignores it
                const timeout = setTimeout(() => {
                    if (isConnectingTo === walletName && !connected) {
                        setIsConnectingTo(null);
                        setError("Connection request timed out. Please try again.");
                    }
                }, 15000);
                setConnectionTimeout(timeout);
                return;
            }

            try {
                await selectedWallet.adapter.connect();
            } catch (err: any) {
                // Ignore WalletReadyStateError as it usually means already connecting/connected
                if (err.name !== 'WalletReadyStateError') {
                    throw err;
                }
            }
        } catch (err: any) {
            console.error("Connect error:", err);
            if (err.name === "WalletWindowClosedError") {
                setError("Request cancelled.");
            } else {
                setError(err.message || "Failed to connect.");
            }
            setIsConnectingTo(null);
        }
    }, [select, wallets, wallet, isConnectingTo, connected]);

    // Clear timeout on unmount or when connected
    useEffect(() => {
        if (connected && connectionTimeout) {
            clearTimeout(connectionTimeout);
            setConnectionTimeout(null);
        }
        return () => {
            if (connectionTimeout) clearTimeout(connectionTimeout);
        };
    }, [connected, connectionTimeout]);


    // Handle Disconnect
    const handleDisconnect = async () => {
        try {
            await disconnect();
        } catch (e) {
            console.error(e);
        }
    };

    if (connected && publicKey) {
        return (
            <Button
                variant="outline"
                onClick={handleDisconnect}
                className={cn(
                    "gap-2 bg-primary/10 border-primary/20 hover:bg-primary/20 text-primary font-mono",
                    className
                )}
            >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
            </Button>
        );
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                setError(null);
                setIsConnectingTo(null);
            }
            setOpen(val);
        }}>
            <Button
                onClick={() => setOpen(true)}
                className={cn("gap-2 font-bold", className)}
            >
                {children || (
                    <>
                        <Wallet className="w-4 h-4" /> Connect Wallet
                    </>
                )}
            </Button>

            <DialogContent className="sm:max-w-[400px] p-0 bg-[#09090B] border-white/10 overflow-hidden gap-0">
                <div className="p-6 pb-2">
                    <div className="flex items-center justify-between mb-2">
                        <DialogTitle className="text-xl font-bold">Connect Wallet</DialogTitle>
                        {/* Close button handled by Dialog primitive, but we can add valid close logic if needed */}
                    </div>
                    <p className="text-sm text-zinc-400">Select your Solana wallet to continue.</p>
                </div>

                <div className="p-4 pt-2 space-y-2">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-400 leading-tight">{error}</p>
                        </div>
                    )}

                    {SUPPORTED_WALLETS.map((w) => {
                        const isInstalled = installedWallets.has(w.name);
                        const isCurrent = wallet?.adapter.name === w.name;
                        const isBusy = isConnectingTo === w.name; // Only busy if explicitly connecting to this one via UI

                        return (
                            <div key={w.name} className="relative group">
                                <button
                                    onClick={() => isInstalled ? handleConnect(w.adapter) : window.open(w.installUrl, '_blank')}
                                    disabled={isBusy || (!!isConnectingTo && isConnectingTo !== w.name)}
                                    className={cn(
                                        "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                                        "hover:bg-white/5 active:scale-[0.98]",
                                        isCurrent ? "border-primary/50 bg-primary/5" : "border-white/5 bg-white/[0.02]",
                                        !isInstalled && "opacity-75"
                                    )}
                                >
                                    <div className="relative w-12 h-12 shrink-0">
                                        <div className={cn(
                                            "absolute inset-0 bg-primary/20 blur-xl rounded-full transition-opacity",
                                            isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                                        )} />
                                        <img
                                            src={w.icon}
                                            alt={w.name}
                                            className="relative w-full h-full object-contain drop-shadow-lg"
                                        />
                                        {!isInstalled && (
                                            <div className="absolute -bottom-1 -right-1 bg-zinc-800 rounded-full p-0.5 border border-zinc-700">
                                                <ExternalLink className="w-3 h-3 text-zinc-400" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-lg">{w.name}</span>
                                            {isBusy && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                                        </div>
                                        <p className="text-xs text-zinc-500 truncate">
                                            {isInstalled ? (isBusy ? "Requesting connection..." : "Detected") : "Not Installed"}
                                        </p>
                                    </div>
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 bg-white/5 border-t border-white/5">
                    <p className="text-center text-xs text-zinc-500">
                        By connecting, you agree to our Terms of Service.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

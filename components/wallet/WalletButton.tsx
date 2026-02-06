"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect } from "react";
import { useWalletStore } from "@/lib/wallet-store";

export function WalletButton() {
    const { publicKey, connected, wallet } = useWallet();
    const { setWalletState } = useWalletStore();

    // Sync wallet adapter state with our store
    useEffect(() => {
        if (connected && publicKey) {
            setWalletState({
                isConnected: true,
                address: publicKey.toBase58(),
                walletType: wallet?.adapter.name || "Unknown",
                balance: 0, // Will be fetched separately
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

    return (
        <WalletMultiButton className="!bg-gradient-to-r !from-amber-600 !to-orange-600 hover:!from-amber-500 hover:!to-orange-500 !rounded-lg !h-10 !px-4 !text-sm !font-medium !transition-all !border-0" />
    );
}

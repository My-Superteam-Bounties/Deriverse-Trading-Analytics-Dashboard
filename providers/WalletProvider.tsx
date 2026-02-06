"use client";

import { useMemo, ReactNode, useCallback } from "react";
import {
    ConnectionProvider,
    WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    CoinbaseWalletAdapter,
    TrustWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletError } from "@solana/wallet-adapter-base";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletProviderProps {
    children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
    // Use devnet for now - can be changed to mainnet-beta in production
    const endpoint = useMemo(() => {
        const rpcUrl = process.env.NEXT_PUBLIC_RPC_HTTP;
        return rpcUrl || clusterApiUrl("devnet");
    }, []);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new CoinbaseWalletAdapter(),
            new TrustWalletAdapter(),
        ],
        []
    );

    const onError = useCallback((error: WalletError) => {
        console.error("Wallet error:", error);
        // You can add custom error handling here
        // For example, show a toast notification
    }, []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <SolanaWalletProvider
                wallets={wallets}
                autoConnect={true}
                onError={onError}
            >
                <WalletModalProvider>{children}</WalletModalProvider>
            </SolanaWalletProvider>
        </ConnectionProvider>
    );
}

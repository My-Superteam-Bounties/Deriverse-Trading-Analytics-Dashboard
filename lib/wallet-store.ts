import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WalletType = 'metamask' | 'phantom' | 'rabby' | 'walletconnect';

interface WalletState {
    isConnected: boolean;
    isConnecting: boolean;
    walletType: WalletType | null;
    address: string | null;
    balance: string | null;
    chainId: string | null; // 'solana' | 'ethereum'

    connect: (type: WalletType) => Promise<void>;
    disconnect: () => void;
}

export const useWalletStore = create<WalletState>()(
    persist(
        (set) => ({
            isConnected: false,
            isConnecting: false,
            walletType: null,
            address: null,
            balance: null,
            chainId: null,

            connect: async (type: WalletType) => {
                set({ isConnecting: true });

                // Simulate connection delay
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Mock data based on wallet type
                const isSolana = type === 'phantom';
                const mockAddress = isSolana
                    ? 'Hu7...9z'
                    : '0x71C...9A21';

                const mockBalance = isSolana
                    ? '145.20 SOL'
                    : '1,240.50 USDC';

                set({
                    isConnected: true,
                    isConnecting: false,
                    walletType: type,
                    address: mockAddress,
                    balance: mockBalance,
                    chainId: isSolana ? 'solana' : 'ethereum'
                });
            },

            disconnect: () => {
                set({
                    isConnected: false,
                    walletType: null,
                    address: null,
                    balance: null,
                    chainId: null
                });
            }
        }),
        {
            name: 'deriverse-wallet-storage',
        }
    )
);

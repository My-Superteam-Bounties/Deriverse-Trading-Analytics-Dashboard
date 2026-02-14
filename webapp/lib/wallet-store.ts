import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WalletType = string;

interface WalletState {
    isConnected: boolean; // Restoring isConnected
    isConnecting: boolean;
    walletType: WalletType | null;
    address: string | null;
    balance: number;

    setWalletState: (state: Partial<WalletState>) => void;
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
            balance: 0,

            setWalletState: (newState) => set((state) => ({ ...state, ...newState })),

            connect: async (type: WalletType) => {
                set({ isConnecting: true });
                // Mock connection delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                set({
                    isConnected: true,
                    isConnecting: false,
                    walletType: type,
                    address: "8x...MockWallet", // Placeholder address
                    balance: 1000 // Placeholder balance
                });
            },

            disconnect: () => {
                set({
                    isConnected: false,
                    isConnecting: false,
                    walletType: null,
                    address: null,
                    balance: 0,
                });
            }
        }),
        {
            name: 'deriverse-wallet-storage',
        }
    )
);

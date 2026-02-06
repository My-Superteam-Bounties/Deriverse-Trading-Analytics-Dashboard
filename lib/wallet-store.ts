import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
    isConnected: boolean;
    walletType: string | null;
    address: string | null;
    balance: number;

    setWalletState: (state: Partial<WalletState>) => void;
    disconnect: () => void;
}

export const useWalletStore = create<WalletState>()(
    persist(
        (set) => ({
            isConnected: false,
            walletType: null,
            address: null,
            balance: 0,

            setWalletState: (newState) => set((state) => ({ ...state, ...newState })),

            disconnect: () => {
                set({
                    isConnected: false,
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

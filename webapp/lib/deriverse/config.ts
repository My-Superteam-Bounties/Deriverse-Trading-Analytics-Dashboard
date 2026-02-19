import { useAppStore } from '@/lib/app-store';

export const DERIVERSE_CONFIG = {
    rpcUrl: process.env.NEXT_PUBLIC_RPC_HTTP || 'https://api.devnet.solana.com',
    wsUrl: process.env.NEXT_PUBLIC_RPC_WS || 'wss://api.devnet.solana.com',
    programId: process.env.NEXT_PUBLIC_DERIVERSE_PROGRAM_ID || 'Derive...Placeholder',
    isTesting: false, // Default to Live Mode (User testing choice > env var)
    analyticsProgram: {
        programId: process.env.NEXT_PUBLIC_DERIVERSE_ANALYTICS_PROGRAM_ID || '',
        rpcUrl: process.env.NEXT_PUBLIC_DERIVERSE_ANALYTICS_RPC_HTTP || 'http://127.0.0.1:8899',
    },
};

// Start using dynamic config where possible
export const getIsTesting = () => {
    // Check local storage DIRECTLY for the persisted state.
    // This ensures synchronous access before React/Zustand hydration might finish.
    if (typeof window !== 'undefined') {
        try {
            const stored = localStorage.getItem('deriverse-app-storage');
            if (stored) {
                const parsed = JSON.parse(stored);
                // "state":{"isDemoMode":true,"version":0}
                if (parsed.state && typeof parsed.state.isDemoMode === 'boolean') {
                    // console.log('[Config] Using persisted demo mode:', parsed.state.isDemoMode);
                    return parsed.state.isDemoMode;
                }
            }
        } catch (e) {
            console.warn("Failed to parse app store for demo mode", e);
        }
    }

    // Default to FALSE (Live Mode) if no persisted value found
    return false;
};

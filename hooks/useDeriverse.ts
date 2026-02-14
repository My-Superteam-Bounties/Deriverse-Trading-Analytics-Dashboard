import '@/lib/polyfill';
import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { DeriverseAnalyticsClient } from '@/lib/deriverse/client';

export function useDeriverse() {
    const { publicKey, connected } = useWallet();
    const [client, setClient] = useState<DeriverseAnalyticsClient | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const initialize = useCallback(async () => {
        if (!connected || !publicKey) {
            console.log('Wallet not connected, skipping Deriverse initialization');
            return;
        }

        // Prevent multiple initialization attempts
        if (isInitialized) {
            console.log('Already initialized');
            return;
        }

        try {
            setIsInitializing(true);
            setError(null);

            // Ensure Buffer is available (Polyfill check)
            if (typeof window !== 'undefined' && !window.Buffer) {
                console.warn('Buffer not yet available, delaying initialization...');
                await new Promise(resolve => setTimeout(resolve, 500));
                if (!window.Buffer) {
                    throw new Error('Buffer polyfill failed to load');
                }
            }

            console.log('Initializing Deriverse SDK with address:', publicKey.toBase58());

            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Initialization timed out after 15s')), 15000)
            );

            const newClient = new DeriverseAnalyticsClient();

            // Race between initialization and timeout
            await Promise.race([
                newClient.initialize(publicKey.toBase58()),
                timeoutPromise
            ]);

            setClient(newClient);
            setIsInitialized(true);
            console.log('Deriverse SDK initialized successfully');
        } catch (err) {
            console.error('Failed to initialize Deriverse SDK:', err);
            setError(err instanceof Error ? err : new Error('Unknown error'));
            setIsInitialized(false); // Ensure we don't get stuck in initializing state
            setClient(null); // Clear client on error
        } finally {
            setIsInitializing(false);
        }
    }, [connected, publicKey, isInitialized]);

    // Auto-initialize when wallet connects
    useEffect(() => {
        if (!connected || !publicKey) {
            setClient(null);
            setIsInitialized(false);
            setError(null);
            return;
        }

        // Avoid double initialization if already active or running
        if (isInitialized || isInitializing) return;

        initialize();
    }, [connected, publicKey, initialize, isInitialized, isInitializing]);

    return {
        client,
        isInitialized,
        isInitializing,
        error,
        initialize,
    };
}

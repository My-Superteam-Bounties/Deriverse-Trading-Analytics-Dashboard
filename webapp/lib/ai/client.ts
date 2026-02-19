/**
 * AI Client — proxies all requests through /api/ai (server-side)
 * API keys are never exposed to the browser.
 */

import { AIProvider } from './ai-store';

/**
 * Main entry point for all AI features.
 * Reads provider from the AI store, sends request to /api/ai.
 */
export async function invokeAI(
    prompt: string,
    options?: {
        provider?: AIProvider;
    }
): Promise<string | null> {
    try {
        // Dynamic import to avoid loading store on server
        const { useAIStore } = await import('./ai-store');
        const store = useAIStore.getState();

        if (!store.isAgentEnabled) {
            console.warn('[AI] Agent is disabled in settings');
            return null;
        }

        const provider = options?.provider || store.provider;

        const res = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, provider }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `AI request failed with status ${res.status}`);
        }

        const data = await res.json();
        return data.response ?? null;
    } catch (error) {
        console.error('[AI] invokeAI failed:', error);
        return null;
    }
}

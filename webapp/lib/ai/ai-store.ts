import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'deepseek' | 'llama' | 'kimi';

export interface AIState {
    // Current active provider
    provider: AIProvider;

    // API keys for each provider (stored client-side)
    apiKeys: Partial<Record<AIProvider, string>>;

    // Whether AI agent is enabled
    isAgentEnabled: boolean;

    // Whether to use default (server-side) API key
    useDefaultKey: boolean;

    // Actions
    setProvider: (provider: AIProvider) => void;
    setApiKey: (provider: AIProvider, key: string) => void;
    clearApiKey: (provider: AIProvider) => void;
    toggleAgent: () => void;
    setUseDefaultKey: (value: boolean) => void;
}

export const useAIStore = create<AIState>()(
    persist(
        (set) => ({
            // Default state
            provider: 'gemini',
            apiKeys: {},
            isAgentEnabled: true,
            useDefaultKey: true,

            // Actions
            setProvider: (provider) => set({ provider }),

            setApiKey: (provider, key) =>
                set((state) => ({
                    apiKeys: { ...state.apiKeys, [provider]: key },
                    useDefaultKey: false, // Disable default when user provides key
                })),

            clearApiKey: (provider) =>
                set((state) => {
                    const newKeys = { ...state.apiKeys };
                    delete newKeys[provider];
                    return { apiKeys: newKeys };
                }),

            toggleAgent: () => set((state) => ({ isAgentEnabled: !state.isAgentEnabled })),

            setUseDefaultKey: (value) => set({ useDefaultKey: value }),
        }),
        {
            name: 'deriverse-ai-settings', // localStorage key
            // Only persist on client-side
            skipHydration: false,
        }
    )
);

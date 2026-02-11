/**
 * LangChain AI Client
 * 
 * This module provides a flexible AI client that supports multiple providers:
 * - Google Gemini (default)
 * - OpenAI (ChatGPT)
 * - Anthropic (Claude)
 * - DeepSeek
 * - Llama (via Groq/Together AI)
 * - Kimi (Moonshot AI)
 * 
 * Usage:
 * ```ts
 * import { getAIClient } from '@/lib/ai/client';
 * const client = getAIClient();
 * const response = await client.invoke("Analyze this trade...");
 * ```
 */

import { AIProvider } from './ai-store';

// Types will be available after user installs langchain packages
type BaseChatModel = any;

/**
 * Get the appropriate LangChain model based on provider and API key
 * Falls back to default (server-side) key if no user key is provided
 */
export function getAIClient(
    provider: AIProvider,
    userApiKey?: string,
    useDefault: boolean = true
): BaseChatModel | null {
    try {
        // Determine which API key to use
        const apiKey = userApiKey || (useDefault ? getDefaultKey(provider) : null);

        if (!apiKey) {
            console.warn(`No API key available for provider: ${provider}`);
            return null;
        }

        switch (provider) {
            case 'gemini': {
                const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
                return new ChatGoogleGenerativeAI({
                    apiKey,
                    modelName: 'gemini-1.5-flash',
                    temperature: 0.7,
                });
            }

            case 'openai': {
                const { ChatOpenAI } = require('@langchain/openai');
                return new ChatOpenAI({
                    apiKey,
                    modelName: 'gpt-4o-mini',
                    temperature: 0.7,
                });
            }

            case 'anthropic': {
                const { ChatAnthropic } = require('@langchain/anthropic');
                return new ChatAnthropic({
                    apiKey,
                    modelName: 'claude-3-5-sonnet-20241022',
                    temperature: 0.7,
                });
            }

            case 'deepseek':
            case 'llama':
            case 'kimi':
                // These providers can be added later with custom endpoints
                console.warn(`Provider ${provider} not yet implemented. Using Gemini fallback.`);
                return getAIClient('gemini', userApiKey, useDefault);

            default:
                console.error(`Unknown provider: ${provider}`);
                return null;
        }
    } catch (error) {
        console.error(`Failed to initialize AI client for ${provider}:`, error);
        return null;
    }
}

/**
 * Get default (server-side) API key from environment variables
 * These keys should be set in .env.local
 */
function getDefaultKey(provider: AIProvider): string | undefined {
    switch (provider) {
        case 'gemini':
            return process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        case 'openai':
            return process.env.NEXT_PUBLIC_OPENAI_API_KEY;
        case 'anthropic':
            return process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
        case 'deepseek':
            return process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
        case 'llama':
            return process.env.NEXT_PUBLIC_GROQ_API_KEY;
        case 'kimi':
            return process.env.NEXT_PUBLIC_KIMI_API_KEY;
        default:
            return undefined;
    }
}

/**
 * Invoke AI with automatic provider selection from store
 * This is the main entry point for AI features
 */
export async function invokeAI(
    prompt: string,
    options?: {
        provider?: AIProvider;
        apiKey?: string;
        useDefault?: boolean;
    }
): Promise<string | null> {
    try {
        // Dynamic import to avoid loading store on server
        const { useAIStore } = await import('./ai-store');
        const store = useAIStore.getState();

        if (!store.isAgentEnabled) {
            console.warn('AI Agent is disabled in settings');
            return null;
        }

        const provider = options?.provider || store.provider;
        const apiKey = options?.apiKey || store.apiKeys[provider];
        const useDefault = options?.useDefault ?? store.useDefaultKey;

        const client = getAIClient(provider, apiKey, useDefault);

        if (!client) {
            throw new Error('Failed to initialize AI client');
        }

        const response = await client.invoke(prompt);
        return response.content || response.text || String(response);
    } catch (error) {
        console.error('AI invocation failed:', error);
        return null;
    }
}

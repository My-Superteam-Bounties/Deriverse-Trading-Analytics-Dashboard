import { NextRequest, NextResponse } from 'next/server';

type AIProvider = 'gemini' | 'openai' | 'anthropic';

/**
 * Server-side AI proxy route.
 * Keeps all API keys private (no NEXT_PUBLIC_ needed).
 * 
 * POST /api/ai
 * Body: { prompt: string, provider?: AIProvider }
 */
export async function POST(req: NextRequest) {
    try {
        const { prompt, provider: requestedProvider } = await req.json();

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
        }

        // Determine provider — default to gemini
        const provider: AIProvider = requestedProvider || 'gemini';

        const response = await invokeProvider(provider, prompt);

        return NextResponse.json({ response });
    } catch (error: any) {
        console.error('[/api/ai] Error:', error);
        return NextResponse.json(
            { error: error.message || 'AI request failed' },
            { status: 500 }
        );
    }
}

async function invokeProvider(provider: AIProvider, prompt: string): Promise<string> {
    switch (provider) {
        case 'gemini': {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment');

            const { ChatGoogleGenerativeAI } = await import('@langchain/google-genai');
            const { HumanMessage } = await import('@langchain/core/messages');
            const model = new ChatGoogleGenerativeAI({
                apiKey,
                model: 'gemini-2.0-flash',
                temperature: 0.7,
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT' as any, threshold: 'BLOCK_ONLY_HIGH' as any },
                    { category: 'HARM_CATEGORY_HATE_SPEECH' as any, threshold: 'BLOCK_ONLY_HIGH' as any },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT' as any, threshold: 'BLOCK_ONLY_HIGH' as any },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT' as any, threshold: 'BLOCK_ONLY_HIGH' as any },
                ],
            });
            const result = await model.invoke([new HumanMessage(prompt)]);
            const text = String(result.content).trim();
            if (!text) throw new Error('Gemini returned an empty response. The prompt may have been blocked by safety filters.');
            return text;
        }


        case 'openai': {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) throw new Error('OPENAI_API_KEY is not set in environment');

            const { ChatOpenAI } = await import('@langchain/openai');
            const model = new ChatOpenAI({
                apiKey,
                modelName: 'gpt-4o-mini',
                temperature: 0.7,
            });
            const result = await model.invoke(prompt);
            return String(result.content);
        }

        case 'anthropic': {
            const apiKey = process.env.ANTHROPIC_API_KEY;
            if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set in environment');

            const { ChatAnthropic } = await import('@langchain/anthropic');
            const model = new ChatAnthropic({
                apiKey,
                modelName: 'claude-3-5-sonnet-20241022',
                temperature: 0.7,
            });
            const result = await model.invoke(prompt);
            return String(result.content);
        }

        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}

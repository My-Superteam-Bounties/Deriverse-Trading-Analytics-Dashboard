import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { invokeAI } from '@/lib/ai/client';
import { toast } from 'sonner';

export type MessageType = 'text' | 'chart' | 'table' | 'image';

export interface ChartData {
    title: string;
    type: 'area' | 'bar' | 'pie';
    data: Record<string, string | number>[];
    config: Record<string, string | number>;
}

export interface TableData {
    title: string;
    columns: string[];
    rows: Record<string, string | number>[];
}

export interface Attachment {
    id: string;
    type: 'image';
    url: string;
    name: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    type: MessageType;
    content?: string;
    chartData?: ChartData;
    tableData?: TableData;
    attachments?: Attachment[];
    timestamp: number;
    isStreaming?: boolean;
}

interface ChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    input: string;
    attachments: Attachment[];
    setInput: (input: string) => void;
    addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
    updateLastMessage: (content: string) => void;
    setLoading: (loading: boolean) => void;
    resetChat: () => void;
    addAttachment: (attachment: Attachment) => void;
    removeAttachment: (id: string) => void;
    clearAttachments: () => void;
    submitQuery: (query: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    isLoading: false,
    input: '',
    attachments: [],

    setInput: (input) => set({ input }),

    addMessage: (message) => set((state) => ({
        messages: [...state.messages, { ...message, id: uuidv4(), timestamp: Date.now() }]
    })),

    updateLastMessage: (content) => set((state) => {
        const messages = [...state.messages];
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = content;
            lastMessage.isStreaming = true;
        }
        return { messages };
    }),

    setLoading: (loading) => set({ isLoading: loading }),

    resetChat: () => set({ messages: [], input: '', attachments: [] }),

    addAttachment: (attachment) => set((state) => ({
        attachments: [...state.attachments, attachment]
    })),

    removeAttachment: (id) => set((state) => ({
        attachments: state.attachments.filter(a => a.id !== id)
    })),

    clearAttachments: () => set({ attachments: [] }),

    submitQuery: async (query) => {
        const { addMessage, setLoading, updateLastMessage, clearAttachments } = get();
        const currentAttachments = get().attachments;

        if (!query.trim()) return;

        // Add user message with attachments
        addMessage({
            role: 'user',
            type: 'text',
            content: query,
            attachments: currentAttachments.length > 0 ? [...currentAttachments] : undefined
        });

        set({ input: '' });
        clearAttachments();
        setLoading(true);

        try {
            // Build context-aware prompt
            const contextPrompt = buildTradingContextPrompt(query, currentAttachments);

            // Add empty assistant message for streaming
            addMessage({
                role: 'assistant',
                type: 'text',
                content: '',
                isStreaming: true
            });

            // Invoke AI with LangChain
            const response = await invokeAI(contextPrompt);

            if (response) {
                // Simulate streaming effect (in production, use actual streaming)
                const words = response.split(' ');
                let currentText = '';

                for (let i = 0; i < words.length; i++) {
                    currentText += (i > 0 ? ' ' : '') + words[i];
                    updateLastMessage(currentText);
                    await new Promise(resolve => setTimeout(resolve, 30)); // Smooth streaming
                }

                // Mark streaming complete
                set((state) => {
                    const messages = [...state.messages];
                    const lastMessage = messages[messages.length - 1];
                    if (lastMessage) {
                        lastMessage.isStreaming = false;
                    }
                    return { messages };
                });
            } else {
                // Fallback to mock response if AI fails
                updateLastMessage("I'm having trouble connecting to the AI service. Please check your API key in Settings or try again later.");

                toast.error("AI Connection Failed", {
                    description: "Please verify your API key in Settings and ensure you have an active internet connection.",
                    duration: 5000,
                });

                set((state) => {
                    const messages = [...state.messages];
                    const lastMessage = messages[messages.length - 1];
                    if (lastMessage) {
                        lastMessage.isStreaming = false;
                    }
                    return { messages };
                });
            }
        } catch (error) {
            console.error('Chat error:', error);
            updateLastMessage("An error occurred while processing your request. Please try again.");

            toast.error("Something went wrong", {
                description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
                duration: 5000,
            });

            set((state) => {
                const messages = [...state.messages];
                const lastMessage = messages[messages.length - 1];
                if (lastMessage) {
                    lastMessage.isStreaming = false;
                }
                return { messages };
            });
        } finally {
            setLoading(false);
        }
    }
}));

/**
 * Build a context-aware prompt for trading analysis
 */
function buildTradingContextPrompt(query: string, attachments: Attachment[]): string {
    let prompt = `You are a professional trading analyst assistant for the Deriverse trading platform. 
You help traders analyze their performance, understand market trends, and make data-driven decisions.

User Query: ${query}`;

    if (attachments.length > 0) {
        prompt += `\n\nThe user has attached ${attachments.length} image(s). Please analyze these charts/screenshots and provide insights.`;
    }

    prompt += `\n\nProvide a clear, concise, and actionable response. Use markdown formatting for better readability.`;

    return prompt;
}

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

export interface ChatSession {
    id: string;
    title: string;
    timestamp: number;
    preview: string;
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
    isDrawerOpen: boolean;
    toggleDrawer: () => void;
    openDrawer: () => void;
    closeDrawer: () => void;
    saveChatToDrive: () => Promise<boolean>;

    // Session Management
    currentSessionId: string;
    history: ChatSession[];
    startNewSession: () => void;
    loadSession: (sessionId: string) => Promise<void>;
    syncWithUrl: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    isLoading: false,
    input: '',
    attachments: [],
    isDrawerOpen: false,
    currentSessionId: uuidv4(),
    history: [],

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

    resetChat: () => get().startNewSession(),

    toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
    openDrawer: () => set({ isDrawerOpen: true }),
    closeDrawer: () => {
        set({ isDrawerOpen: false });
        get().resetChat(); // Auto-reset on close
    },

    addAttachment: (attachment) => set((state) => ({
        attachments: [...state.attachments, attachment]
    })),

    removeAttachment: (id) => set((state) => ({
        attachments: state.attachments.filter(a => a.id !== id)
    })),

    clearAttachments: () => set({ attachments: [] }),

    saveChatToDrive: async () => {
        const { messages, currentSessionId } = get();
        if (messages.length === 0) return false;

        try {
            const timestamp = new Date().toISOString();
            const title = messages[0]?.content?.slice(0, 30) || 'New Chat';
            const filename = `Chat_${currentSessionId}.json`;
            const content = JSON.stringify({
                id: currentSessionId,
                title,
                timestamp,
                messages
            }, null, 2);

            const response = await fetch('/api/drive', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'saveChat',
                    // fileType: 'chat', // No longer needed
                    filename,
                    content
                })
            });

            if (!response.ok) throw new Error('Failed to save to Drive');

            // Add to history if not exists
            set(state => {
                const exists = state.history.find(h => h.id === currentSessionId);
                if (exists) return state;
                return {
                    history: [{
                        id: currentSessionId,
                        title,
                        timestamp: Date.now(),
                        preview: messages[messages.length - 1]?.content?.slice(0, 50) || ''
                    }, ...state.history]
                };
            });

            toast.success("Chat saved to Drive");
            return true;
        } catch (error) {
            console.error('Save to Drive failed:', error);
            toast.error("Failed to save chat");
            return false;
        }
    },

    startNewSession: () => {
        const newId = uuidv4();
        set({
            messages: [],
            input: '',
            attachments: [],
            currentSessionId: newId
        });

        // Clear URL param for new session
        const url = new URL(window.location.href);
        url.searchParams.delete('chatId');
        window.history.pushState({}, '', url);
    },

    loadSession: async (sessionId) => {
        // Placeholder: In a real app, fetch from Drive or LocalStorage
        // For now, just set the ID and clear messages if it's a "new" one
        set({ currentSessionId: sessionId, messages: [] });

        const url = new URL(window.location.href);
        url.searchParams.set('chatId', sessionId);
        window.history.pushState({}, '', url);

        toast.info(`Switched to session: ${sessionId.slice(0, 8)}`);
    },

    syncWithUrl: () => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const chatId = params.get('chatId');

        if (chatId && chatId !== get().currentSessionId) {
            set({ currentSessionId: chatId });
        }
        // Do NOT automatically set URL if empty. Wait for user action.
    },

    submitQuery: async (query) => {
        const { addMessage, setLoading, updateLastMessage, clearAttachments, currentSessionId, messages } = get();
        const currentAttachments = get().attachments;

        if (!query.trim()) return;

        // If this is the first message of a new session, update URL
        if (messages.length === 0) {
            const url = new URL(window.location.href);
            if (!url.searchParams.has('chatId')) {
                url.searchParams.set('chatId', currentSessionId);
                window.history.pushState({}, '', url);
            }
        }

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

            // Invoke AI with LangChain
            const response = await invokeAI(contextPrompt);

            // Remove loading state immediately so we don't show both loader and streaming message
            setLoading(false);

            if (response) {
                // Add empty assistant message for streaming
                addMessage({
                    role: 'assistant',
                    type: 'text',
                    content: '',
                    isStreaming: true
                });

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
                addMessage({
                    role: 'assistant',
                    type: 'text',
                    content: "I'm having trouble connecting to the AI service. Please check your API key in Settings or try again later.",
                    isStreaming: false
                });

                toast.error("AI Connection Failed", {
                    description: "Please verify your API key in Settings and ensure you have an active internet connection.",
                    duration: 5000,
                });
            }
        } catch (error) {
            console.error('Chat error:', error);
            setLoading(false);

            addMessage({
                role: 'assistant',
                type: 'text',
                content: "An error occurred while processing your request. Please try again.",
                isStreaming: false
            });

            toast.error("Something went wrong", {
                description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
                duration: 5000,
            });
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

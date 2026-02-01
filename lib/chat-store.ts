import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type MessageType = 'text' | 'chart' | 'table';

export interface ChartData {
    title: string;
    type: 'area' | 'bar' | 'pie';
    data: Record<string, string | number>[];
    config: Record<string, string | number>; // visual config
}

export interface TableData {
    title: string;
    columns: string[];
    rows: Record<string, string | number>[];
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    type: MessageType;
    content?: string;
    chartData?: ChartData;
    tableData?: TableData;
    timestamp: number;
}

interface ChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    input: string;
    setInput: (input: string) => void;
    addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
    setLoading: (loading: boolean) => void;
    resetChat: () => void;
    // Mock action to simulate AI response
    submitQuery: (query: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    isLoading: false,
    input: '',
    setInput: (input) => set({ input }),
    addMessage: (message) => set((state) => ({
        messages: [...state.messages, { ...message, id: uuidv4(), timestamp: Date.now() }]
    })),
    setLoading: (loading) => set({ isLoading: loading }),
    resetChat: () => set({ messages: [], input: '' }),

    submitQuery: async (query) => {
        const { addMessage, setLoading } = get();

        if (!query.trim()) return;

        // Add user message
        addMessage({ role: 'user', type: 'text', content: query });
        set({ input: '' });
        setLoading(true);

        // Simulate AI delay
        setTimeout(() => {
            // Mock Responses based on query
            if (query.toLowerCase().includes('win rate') || query.toLowerCase().includes('pnl')) {
                addMessage({
                    role: 'assistant',
                    type: 'text',
                    content: "Based on your recent trading activity, your **Win Rate** is currently **64%**. Here is the PnL breakdown over the last 30 days."
                });

                addMessage({
                    role: 'assistant',
                    type: 'chart',
                    chartData: {
                        title: 'Cumulative PnL (30d)',
                        type: 'area',
                        data: [
                            { date: 'Jan 01', value: 1200 },
                            { date: 'Jan 05', value: 3000 },
                            { date: 'Jan 10', value: 2500 },
                            { date: 'Jan 15', value: 3800 },
                            { date: 'Jan 20', value: 4200 },
                            { date: 'Jan 25', value: 5100 },
                            { date: 'Jan 30', value: 6500 },
                        ],
                        config: { color: '#06b6d4' }
                    }
                });
            } else if (query.toLowerCase().includes('history') || query.toLowerCase().includes('trades')) {
                addMessage({
                    role: 'assistant',
                    type: 'text',
                    content: "Here are your recent high-value transactions."
                });
                addMessage({
                    role: 'assistant',
                    type: 'table',
                    tableData: {
                        title: 'Recent Large Trades',
                        columns: ['Symbol', 'Side', 'Size', 'PnL'],
                        rows: [
                            { Symbol: 'SOL-PERP', Side: 'LONG', Size: '$50,000', PnL: '+$4,200' },
                            { Symbol: 'BTC-PERP', Side: 'SHORT', Size: '$120,000', PnL: '-$1,200' },
                            { Symbol: 'ETH-OPT', Side: 'LONG', Size: '$25,000', PnL: '+$3,800' },
                        ]
                    }
                });
            } else {
                addMessage({
                    role: 'assistant',
                    type: 'text',
                    content: "I can help you analyze your portfolio. Try asking about your **PnL**, **Win Rate**, or **Trade History**."
                });
            }

            setLoading(false);
        }, 1500);
    }
}));

"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Search, Sparkles, ArrowRight, BarChart3, Clock, Wallet, Upload } from "lucide-react";
import { useChatStore } from "@/lib/chat-store";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageList } from "@/components/chat/MessageList";
import { WalletGuard } from "@/components/dashboard/WalletGuard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { useDeriverse } from "@/hooks/useDeriverse";
import { cn } from "@/lib/utils";

import { sendGTMEvent } from "@next/third-parties/google";

interface IntelligenceViewProps {
    onSwitchToTerminal: () => void;
}

export function IntelligenceView({ onSwitchToTerminal }: IntelligenceViewProps) {
    const { messages, input, setInput, submitQuery } = useChatStore();
    const { publicKey } = useWallet();
    const { client, isInitialized } = useDeriverse();
    const [hasTradesData, setHasTradesData] = useState<boolean | null>(null);
    const isChatActive = messages.length > 0;

    // Check if user has any trading data
    useEffect(() => {
        async function checkTrades() {
            if (!client || !isInitialized) {
                setHasTradesData(null);
                return;
            }

            try {
                // Timebox the data fetch to 10 seconds max
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Data check timed out")), 10000)
                );

                // Check for positions or trades
                const dataCheck = async () => {
                    const positions = await client.getUserPositions();
                    const trades = await client.getTradeHistory(10);
                    return positions.length > 0 || trades.length > 0;
                };

                const hasData = await Promise.race([
                    dataCheck(),
                    timeoutPromise
                ]) as boolean;

                setHasTradesData(hasData);
            } catch (error) {
                console.error("Error checking trades (defaulting to empty):", error);
                // Assume no trades on error/timeout to unblock UI
                setHasTradesData(false);
            }
        }

        // Delay slightly to allow UI to settle
        const timer = setTimeout(checkTrades, 500);
        return () => clearTimeout(timer);
    }, [client, isInitialized]);

    // Scroll to bottom helper
    useEffect(() => {
        if (isChatActive) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        }
    }, [messages, isChatActive]);

    // Show loading state while checking
    if (hasTradesData === null) {
        return <LoadingState />;
    }

    // Show empty state if no trades
    if (hasTradesData === false) {
        return <EmptyState walletAddress={publicKey?.toBase58()} />;
    }

    return (
        <WalletGuard>
            <div className={cn(
                "w-full mx-auto transition-all duration-500",
                isChatActive ? "h-full" : "min-h-[80vh] flex flex-col items-center justify-center gap-16"
            )}>
                {/* 1. Hero Content (Only visible when no chat) */}
                {!isChatActive && (
                    <div className="text-center space-y-6 max-w-4xl mx-auto animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/20 border border-border text-[10px] font-semibold uppercase tracking-wider text-amber-500 animate-fade-in backdrop-blur-md">
                            <Sparkles className="h-3 w-3" />
                            <span>Deriverse Intelligence</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                            Ask the Market.
                        </h1>

                        <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
                            A next-gen analytics layer for the Deriverse ecosystem.
                            Analyze <span className="text-foreground font-medium">Spot, Perpetual, and Options</span> markets.
                        </p>

                        {/* Initial Input Interface */}
                        <div className="w-full max-w-2xl relative group mx-auto mt-12">
                            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-lg duration-500"></div>
                            <div className="relative bg-card border border-border rounded-2xl p-2 flex items-center shadow-2xl focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center text-muted-foreground shrink-0">
                                    <Search className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && input.trim() && submitQuery(input)}
                                    placeholder="Ask about PnL, Win Rates, or specific Symbol Analysis..."
                                    className="w-full bg-transparent border-none focus:ring-0 text-base px-3 text-foreground placeholder:text-muted-foreground font-normal h-10 outline-none"
                                    autoFocus
                                />
                                <button
                                    onClick={() => input.trim() && submitQuery(input)}
                                    className="h-10 px-6 rounded-xl bg-foreground text-background font-semibold flex items-center justify-center hover:opacity-90 transition-all gap-2 shrink-0 transform active:scale-95"
                                >
                                    <span>Go</span>
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="flex justify-between px-2 mt-2">
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Upload className="h-3 w-3" /> Drop charts or CSvs to analyze
                                </span>
                            </div>

                            {/* Quick Suggestions */}
                            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                                <span className="text-sm text-muted-foreground">Try:</span>
                                {[
                                    { label: "Analyze my Win Rate", icon: BarChart3 },
                                    { label: "Show Portfolio Drawdown", icon: Wallet },
                                    { label: "Session Volume Breakdown", icon: Clock }
                                ].map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => submitQuery(suggestion.label)}
                                        className="px-3 py-1.5 rounded-lg border border-border bg-card/50 hover:bg-muted text-xs text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors backdrop-blur-lg cursor-pointer"
                                    >
                                        <suggestion.icon className="h-3 w-3 text-amber-500" />
                                        {suggestion.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Feature Grid */}
                        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto">
                            {[
                                {
                                    title: "Portfolio Intelligence",
                                    desc: "Complete PnL tracking, fee analysis, and drawdown visualization.",
                                },
                                {
                                    title: "Market Deep Dives",
                                    desc: "Granular analysis of Spot, Perp, and Option markets.",
                                },
                                {
                                    title: "Behavioral Metrics",
                                    desc: "Understand your edge with time-of-day heatmaps.",
                                }
                            ].map((item, i) => (
                                <div key={i} className="bg-card/30 p-8 rounded-3xl border border-border/50 flex flex-col gap-6 hover:translate-y-[-4px] transition-transform duration-300 group backdrop-blur-sm">
                                    <div className="h-0.5 w-10 bg-gradient-to-r from-amber-500 to-transparent"></div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed font-light text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Active Chat Interface */}
                {isChatActive && (
                    <div className="w-full max-w-4xl mx-auto animate-fade-in relative min-h-screen">
                        <div className="w-full pb-32">
                            <MessageList />
                        </div>
                        {/* Floating Input */}
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent z-40">
                            <div className="md:ml-20"> {/* Offset for sidebar if needed, or centering */}
                                <ChatInput isFloating={true} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </WalletGuard>
    );
}

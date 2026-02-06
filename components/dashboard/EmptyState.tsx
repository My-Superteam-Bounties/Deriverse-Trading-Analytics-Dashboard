"use client";

import { Rocket, TrendingUp, Brain, History, Shield, BarChart3, ExternalLink } from "lucide-react";

interface EmptyStateProps {
    walletAddress?: string;
}

export function EmptyState({ walletAddress }: EmptyStateProps) {
    const features = [
        { icon: TrendingUp, text: "Real-time PnL tracking" },
        { icon: BarChart3, text: "Win rate analytics" },
        { icon: Brain, text: "AI-powered insights" },
        { icon: History, text: "Trade history analysis" },
        { icon: Shield, text: "Risk metrics & alerts" },
    ];

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-8">
            <div className="max-w-2xl w-full text-center space-y-8">
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                        <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-full border border-amber-500/20">
                            <Rocket className="h-16 w-16 text-amber-500" />
                        </div>
                    </div>
                </div>

                {/* Heading */}
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                        No Deriverse Trades Found
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        This wallet has not executed any trades on Deriverse yet.
                    </p>
                    {walletAddress && (
                        <p className="text-sm text-muted-foreground/70 font-mono">
                            {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                        </p>
                    )}
                </div>

                {/* Features List */}
                <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-800/50 border border-white/5 rounded-2xl p-8 space-y-4">
                    <p className="text-sm font-medium text-amber-500 uppercase tracking-wider">
                        Start trading to unlock
                    </p>
                    <div className="grid gap-3">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 text-left p-3 rounded-lg bg-white/5 border border-white/5 hover:border-amber-500/20 transition-colors"
                            >
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                                    <feature.icon className="h-4 w-4 text-amber-500" />
                                </div>
                                <span className="text-sm text-white/90">{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="space-y-4">
                    <a
                        href="https://app.deriverse.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        <Rocket className="h-5 w-5" />
                        Open Deriverse Trading App
                        <ExternalLink className="h-4 w-4" />
                    </a>
                    <p className="text-xs text-muted-foreground">
                        Analytics will appear automatically once you execute trades
                    </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-sm text-blue-400">
                        <strong>No signup required.</strong> Your wallet is your identity. Analytics are generated automatically from your on-chain trading activity.
                    </p>
                </div>
            </div>
        </div>
    );
}

"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DashboardMetrics } from "@/hooks/useDeriverseData";
import { Sparkles, Trophy, TrendingUp, Activity, Brain, Rocket, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardOverviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: DashboardMetrics | null;
}

export function DashboardOverviewDialog({ open, onOpenChange, data }: DashboardOverviewDialogProps) {
    if (!data) return null;

    const { totalPnL, winRate, totalTrades, realizedPnL, bestWin } = {
        totalPnL: data.totalPnL || 0,
        winRate: data.winRate || 0,
        totalTrades: data.totalTrades || 0,
        realizedPnL: data.realizedPnL || 0,
        bestWin: data.largestWin || 0
    };

    // "Fun" Personality Logic
    const getPersonality = () => {
        if (totalTrades === 0) return { title: " The Observer", desc: "Patiently waiting for the perfect setup. Smart.", icon: Brain };
        if (winRate > 60) return { title: "The Sniper", desc: "High accuracy execution. You don't miss often.", icon: Trophy };
        if (totalPnL > 1000) return { title: "The Whale", desc: "Moving markets and taking names.", icon: Rocket };
        if (totalTrades > 20) return { title: "The Machine", desc: "High frequency action. The market never sleeps, neither do you.", icon: Zap };
        return { title: "The Trader", desc: "Building your edge, one trade at a time.", icon: TrendingUp };
    };

    const personality = getPersonality();
    const Icon = personality.icon;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[80vw] w-[80vw] border-white/10 bg-zinc-950/80 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl">

                {/* Hero Section: Personality */}
                <div className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-transparent p-10 md:p-14 text-center">
                    {/* Background Decor */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl pointer-events-none">
                        <div className="w-96 h-96 bg-amber-500 rounded-full mix-blend-screen" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
                        <div className="p-5 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl shadow-2xl shadow-amber-500/20 mb-6 transform hover:scale-105 transition-transform duration-500">
                            <Icon className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-3">
                            {personality.title}
                        </h2>
                        <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
                            {personality.desc}
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="p-8 md:p-10 bg-zinc-950/50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">

                        {/* Total PnL */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors group">
                            <div className="flex items-center gap-3 mb-4 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <Activity className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Total PnL</span>
                            </div>
                            <div>
                                <div className={cn("text-3xl font-mono font-bold tracking-tight", totalPnL >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                    ${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <div className="text-xs text-zinc-500 mt-2">Realized: ${realizedPnL.toLocaleString()}</div>
                            </div>
                        </div>

                        {/* Win Rate */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors group">
                            <div className="flex items-center gap-3 mb-4 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <Trophy className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Win Rate</span>
                            </div>
                            <div>
                                <div className="text-3xl font-mono font-bold text-amber-400 tracking-tight">
                                    {winRate.toFixed(1)}%
                                </div>
                                <div className="text-xs text-zinc-500 mt-2">from {totalTrades} total trades</div>
                            </div>
                        </div>

                        {/* Best Win */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors group">
                            <div className="flex items-center gap-3 mb-4 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Best Win</span>
                            </div>
                            <div>
                                <div className="text-3xl font-mono font-bold text-cyan-400 tracking-tight">
                                    ${bestWin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <div className="text-xs text-zinc-500 mt-2">Top Performance</div>
                            </div>
                        </div>

                        {/* Action / Insight */}
                        <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 rounded-2xl p-6 border border-amber-500/20 flex flex-col justify-between">
                            <div>
                                <h4 className="font-bold text-amber-200 mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Keep It Up
                                </h4>
                                <p className="text-xs text-amber-200/60 leading-relaxed">
                                    Consistent logging improves performance by 40%. You're on the right path.
                                </p>
                            </div>
                            <div className="mt-4">
                                <Button size="sm" onClick={() => onOpenChange(false)} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                                    Back to Trading
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

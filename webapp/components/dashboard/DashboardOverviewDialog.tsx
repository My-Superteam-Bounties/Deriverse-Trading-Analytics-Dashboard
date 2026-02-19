"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DashboardMetrics } from "@/hooks/useDeriverseData";
import { Sparkles, Activity, TrendingUp, DollarSign, Wallet, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { OverviewChart } from "./OverviewChart";
import { invokeAI } from "@/lib/ai/client";
import { useState, useEffect } from "react";

interface DashboardOverviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: DashboardMetrics | null;
}

export function DashboardOverviewDialog({ open, onOpenChange, data }: DashboardOverviewDialogProps) {
    const [summary, setSummary] = useState<string>("");
    const [isSummarizing, setIsSummarizing] = useState(false);

    useEffect(() => {
        if (!open || !data) return;
        setIsSummarizing(true);
        setSummary("");

        const { totalPnL, winRate, totalTrades, totalVolume } = {
            totalPnL: data.totalPnL || 0,
            winRate: data.winRate || 0,
            totalTrades: data.totalTrades || 0,
            totalVolume: data.totalVolume || 0,
        };

        const prompt = `You are a professional trading analyst. Provide a 2-3 sentence performance summary for a trader with these stats:
- Total PnL: $${totalPnL.toFixed(2)}
- Win Rate: ${winRate.toFixed(1)}%
- Total Trades: ${totalTrades}
- Total Volume: $${totalVolume.toLocaleString()}

Be concise, insightful, and encouraging. Focus on what the numbers reveal about their trading style and edge.`;

        invokeAI(prompt).then((res) => {
            setSummary(res || "Unable to generate summary. Please check your AI configuration.");
        }).finally(() => setIsSummarizing(false));
    }, [open, data]);

    if (!data) return null;

    const { totalPnL, winRate, totalTrades, realizedPnL, totalVolume, trades } = {
        totalPnL: data.totalPnL || 0,
        winRate: data.winRate || 0,
        totalTrades: data.totalTrades || 0,
        realizedPnL: data.realizedPnL || 0,
        totalVolume: data.totalVolume || 0,
        trades: data.trades || []
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] md:max-w-5xl w-full border-white/10 bg-zinc-950/95 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl sm:rounded-3xl">

                <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">

                    {/* Left Panel: Metrics & AI */}
                    <div className="md:col-span-4 bg-zinc-900/50 p-8 flex flex-col justify-between border-r border-white/5 relative overflow-hidden">
                        {/* Ambient Glow */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6 text-amber-500">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-xs font-bold tracking-widest uppercase">Intelligence Overview</span>
                            </div>

                            <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
                                Your Trading <br /> Performance
                            </h2>

                            <div className="bg-white/5 rounded-xl p-5 border border-white/5 mb-8 backdrop-blur-md min-h-[80px] flex items-center">
                                {isSummarizing ? (
                                    <div className="flex items-center gap-3 text-zinc-400">
                                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                                        <span className="text-sm italic">Analyzing your performance...</span>
                                    </div>
                                ) : (
                                    <p className="text-zinc-300 text-sm leading-relaxed italic">
                                        "{summary}"
                                    </p>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Total Volume</div>
                                    <div className="text-2xl font-mono text-white tracking-tight">
                                        ${totalVolume.toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Win Rate</div>
                                    <div className="text-2xl font-mono text-amber-400 tracking-tight">
                                        {winRate.toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 relative z-10">
                            <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white" onClick={() => onOpenChange(false)}>
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>

                    {/* Right Panel: Primary Chart & PnL */}
                    <div className="md:col-span-8 p-8 bg-black/40 flex flex-col relative">
                        <DialogHeader className="mb-6 flex flex-row items-center justify-between">
                            <div>
                                <DialogTitle className="text-xl text-white font-medium">Cumulative PnL</DialogTitle>
                                <DialogDescription className="text-zinc-500">Based on realized trade history</DialogDescription>
                            </div>
                            <div className="text-right">
                                <div className={cn("text-3xl font-mono font-bold tracking-tight", totalPnL >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                    ${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <div className="text-xs text-zinc-500 mt-1">Net Profit/Loss</div>
                            </div>
                        </DialogHeader>

                        {/* Chart Area */}
                        <div className="flex-1 bg-white/5 rounded-2xl border border-white/5 p-0 relative overflow-hidden group min-h-[300px]">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-0"></div>
                            <div className="relative z-10 h-full w-full flex flex-col p-4">
                                <OverviewChart trades={trades} />
                            </div>
                        </div>

                        {/* Quick Stats Row */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-zinc-900/50 rounded-xl p-4 flex items-center gap-4 border border-white/5">
                                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-white font-mono">{totalTrades}</div>
                                    <div className="text-xs text-zinc-500">Total Trades</div>
                                </div>
                            </div>
                            <div className="bg-zinc-900/50 rounded-xl p-4 flex items-center gap-4 border border-white/5">
                                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-white font-mono">${realizedPnL.toLocaleString()}</div>
                                    <div className="text-xs text-zinc-500">Realized PnL</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}

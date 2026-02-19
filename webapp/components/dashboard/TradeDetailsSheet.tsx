"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Bot, ArrowRight, TrendingUp, TrendingDown, Clock, Hash, DollarSign, PenLine, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { invokeAI } from "@/lib/ai/client";

interface Trade {
    timestamp: number;
    symbol: string;
    side: string;
    price: number;
    size: number;
    pnl?: number;
    fee?: number;
}

interface TradeDetailsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trade: Trade | null;
    onAddJournal: (trade: Trade) => void;
}

export function TradeDetailsSheet({ open, onOpenChange, trade, onAddJournal }: TradeDetailsSheetProps) {
    const [aiAnalysis, setAiAnalysis] = useState<string>("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Real AI Analysis when sheet opens
    useEffect(() => {
        if (open && trade) {
            setIsAnalyzing(true);
            setAiAnalysis("");

            const prompt = `You are a professional trading analyst. Analyze this trade and provide a concise 3-4 sentence insight:
- Symbol: ${trade.symbol}
- Side: ${trade.side}
- Entry Price: $${trade.price.toFixed(2)}
- Size: ${trade.size.toFixed(4)}
- PnL: $${trade.pnl?.toFixed(2) ?? 'N/A'}
- Fee: $${trade.fee?.toFixed(4) ?? 'N/A'}
- Time: ${format(trade.timestamp, 'MMM dd, yyyy HH:mm')}

Comment on execution quality, risk/reward, and one actionable suggestion. Be direct and specific.`;

            invokeAI(prompt)
                .then((res) => {
                    setAiAnalysis(res || "Unable to generate analysis. Please check your AI configuration.");
                })
                .catch(() => setAiAnalysis("Analysis failed. Please try again."))
                .finally(() => setIsAnalyzing(false));
        }
    }, [open, trade]);

    if (!trade) return null;

    const isWin = (trade.pnl || 0) >= 0;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-card border-l border-white/5 p-0 gap-0">
                {/* Header Image / Gradient */}
                <div className={`h-32 w-full ${isWin ? 'bg-gradient-to-br from-green-500/20 to-emerald-900/10' : 'bg-gradient-to-br from-red-500/20 to-rose-900/10'} relative`}>
                    <div className="absolute inset-0 bg-dot-grid opacity-30" />
                    <div className="absolute bottom-4 left-6">
                        <Badge variant={isWin ? "default" : "destructive"} className="mb-2 text-xs font-bold tracking-wider">
                            {isWin ? "WINNING TRADE" : "LOSING TRADE"}
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                            {trade.symbol}
                            <span className={`text-lg font-medium px-2 py-0.5 rounded-md ${trade.side === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {trade.side}
                            </span>
                        </h2>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <DollarSign className="w-3 h-3" /> PnL
                            </span>
                            <p className={`text-2xl font-mono font-bold ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                                {trade.pnl && trade.pnl > 0 ? "+" : ""}{trade.pnl?.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Hash className="w-3 h-3" /> Size
                            </span>
                            <p className="text-2xl font-mono font-bold text-foreground">
                                {trade.size.toFixed(4)}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <DollarSign className="w-3 h-3" /> Price
                            </span>
                            <p className="text-xl font-mono font-bold text-foreground">
                                {trade.price.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Time
                            </span>
                            <p className="text-sm font-medium text-foreground">
                                {format(trade.timestamp, "MMM dd, yyyy")}
                                <br />
                                <span className="text-muted-foreground">{format(trade.timestamp, "HH:mm:ss")}</span>
                            </p>
                        </div>
                    </div>

                    <Separator className="bg-white/10" />

                    {/* AI Analysis Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <Bot className="w-5 h-5" />
                            <h3 className="font-semibold text-lg">AI Trade Analysis</h3>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 relative overflow-hidden">
                            {isAnalyzing ? (
                                <div className="space-y-3">
                                    <div className="h-4 bg-primary/20 rounded w-3/4 animate-pulse"></div>
                                    <div className="h-4 bg-primary/20 rounded w-full animate-pulse"></div>
                                    <div className="h-4 bg-primary/20 rounded w-5/6 animate-pulse"></div>
                                </div>
                            ) : (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {aiAnalysis}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator className="bg-white/10" />

                    {/* Journal Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-amber-400">
                                <PenLine className="w-5 h-5" />
                                <h3 className="font-semibold text-lg">Trading Journal</h3>
                            </div>
                        </div>

                        <div className="bg-card border border-white/5 rounded-xl p-6 text-center space-y-4">
                            <p className="text-muted-foreground text-sm">
                                No journal entry found for this trade. Documenting your psychology is key to improvement.
                            </p>
                            <Button
                                onClick={() => onAddJournal(trade)}
                                className="w-full bg-white/5 hover:bg-white/10 text-foreground border border-white/10"
                            >
                                <PenLine className="w-4 h-4 mr-2" />
                                Add Journal Entry
                            </Button>
                        </div>
                    </div>

                </div>
            </SheetContent>
        </Sheet>
    );
}


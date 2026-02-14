"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TradeHistory } from "@/lib/deriverse/client";
import { Sparkles, Brain, Save, Trash2, Smile, Frown, Meh, Rocket, Skull } from "lucide-react";
import { cn } from "@/lib/utils";

interface TradingJournalProps {
    trade?: TradeHistory | null; // Optional now
    recentTrades?: TradeHistory[]; // List for selection
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface JournalEntry {
    mood: string;
    notes: string;
    tags: string[];
}

const MOODS = [
    { id: "happy", icon: Smile, label: "Happy", color: "text-green-500 bg-green-500/10" },
    { id: "sad", icon: Frown, label: "Sad", color: "text-red-500 bg-red-500/10" },
    { id: "meh", icon: Meh, label: "Meh", color: "text-amber-500 bg-amber-500/10" },
    { id: "ape", icon: Rocket, label: "Ape", color: "text-purple-500 bg-purple-500/10" },
    { id: "rekt", icon: Skull, label: "Rekt", color: "text-zinc-500 bg-zinc-500/10" },
];

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TradingJournal({ trade: initialTrade, recentTrades = [], open, onOpenChange }: TradingJournalProps) {
    const [selectedTrade, setSelectedTrade] = useState<TradeHistory | null>(initialTrade || null);
    const [entry, setEntry] = useState<JournalEntry>({ mood: "", notes: "", tags: [] });
    const [aiInsight, setAiInsight] = useState<string>("");

    // Reset selected trade when dialog opens/closes or initialTrade changes
    useEffect(() => {
        if (open) {
            setSelectedTrade(initialTrade || null);
        }
    }, [open, initialTrade]);

    // Load entry from localStorage when selectedTrade changes
    useEffect(() => {
        if (open) {
            const key = selectedTrade ? `journal_${selectedTrade.orderId}` : `journal_general_${new Date().toISOString().split('T')[0]}`;
            const saved = localStorage.getItem(key);
            if (saved) {
                setEntry(JSON.parse(saved));
            } else {
                setEntry({ mood: "", notes: "", tags: [] });
            }
            if (selectedTrade) generateInsight(selectedTrade);
        }
    }, [selectedTrade, open]);

    const generateInsight = (t: TradeHistory) => {
        const pnl = t.pnl || 0;
        const isWin = pnl > 0;

        // Mock "Smart" Analysis
        if (isWin && pnl > 100) {
            setAiInsight("Excellent execution. You captured a major move. High conviction setup paid off.");
        } else if (isWin) {
            setAiInsight("Solid disciplined win. Small gains compound over time.");
        } else if (!isWin && pnl > -50) {
            setAiInsight("Good risk management. You cut the loss early before it spiraled.");
        } else {
            setAiInsight("Review your stop loss placement. This drawdown suggests oversizing.");
        }
    };

    const handleSave = () => {
        const key = selectedTrade ? `journal_${selectedTrade.orderId}` : `journal_general_${new Date().toISOString().split('T')[0]}`;
        localStorage.setItem(key, JSON.stringify(entry));
        onOpenChange(false);
    };

    // Helper to find trade by ID for the select
    const handleSelectTrade = (tradeId: string) => {
        const t = recentTrades.find(r => r.orderId.toString() === tradeId);
        if (t) setSelectedTrade(t);
    };

    const activeTrade = selectedTrade;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-[#09090B] border-white/10">
                <DialogHeader>
                    {activeTrade ? (
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={cn(
                                "px-2 py-0.5 text-xs font-mono",
                                activeTrade.side === "BUY" ? "border-green-500/20 text-green-400" : "border-red-500/20 text-red-400"
                            )}>
                                {activeTrade.side}
                            </Badge>
                            <DialogTitle className="text-xl font-bold">{activeTrade.symbol}</DialogTitle>

                            {/* Allow Switching Context even if selected */}
                            {!initialTrade && (
                                <button
                                    onClick={() => setSelectedTrade(null)}
                                    className="ml-2 text-xs text-muted-foreground hover:text-amber-400 underline"
                                >
                                    Change
                                </button>
                            )}

                            <span className="text-sm text-zinc-500 font-mono ml-auto">
                                {activeTrade.timestamp.toLocaleString()}
                            </span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <DialogTitle className="text-xl font-bold text-amber-400">Journal Entry</DialogTitle>
                                <span className="text-sm text-zinc-500 font-mono">
                                    {new Date().toLocaleDateString()}
                                </span>
                            </div>

                            {/* Trade Selector */}
                            {recentTrades.length > 0 && (
                                <Select onValueChange={handleSelectTrade}>
                                    <SelectTrigger className="w-full bg-white/5 border-white/10">
                                        <SelectValue placeholder="Select a recent trade to journal..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {recentTrades.map(t => (
                                            <SelectItem key={t.orderId} value={t.orderId.toString()}>
                                                <span className="font-mono mr-2">{t.symbol}</span>
                                                <span className={t.side === "BUY" ? "text-green-400" : "text-red-400"}>{t.side}</span>
                                                <span className="ml-2 text-muted-foreground">(${t.pnl?.toFixed(2)})</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    )}

                    <DialogDescription className="text-zinc-400">
                        {activeTrade ? (
                            <>
                                PnL: <span className={cn("font-mono font-bold", (activeTrade.pnl || 0) >= 0 ? "text-green-400" : "text-red-400")}>
                                    ${(activeTrade.pnl || 0).toFixed(2)}
                                </span>
                            </>
                        ) : (
                            "Log your thoughts, market observations, or select a trade to review."
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* AI Insight - Only show if trade exists */}
                    {activeTrade && (
                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Brain className="w-12 h-12 text-blue-500" />
                            </div>
                            <div className="flex items-start gap-3 relative z-10">
                                <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="text-sm font-semibold text-blue-100">AI Analysis</h4>
                                    <p className="text-sm text-blue-200/80 leading-relaxed italic">
                                        "{aiInsight}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mood Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">How did you feel?</label>
                        <div className="flex gap-2">
                            {MOODS.map((m) => {
                                const Icon = m.icon;
                                const isSelected = entry.mood === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => setEntry({ ...entry, mood: m.id })}
                                        className={cn(
                                            "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all",
                                            isSelected
                                                ? `border-${m.color.split(' ')[0].split('-')[1]}-500 bg-white/5`
                                                : "border-transparent hover:bg-white/5",
                                            m.color
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-[10px] font-medium">{m.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Trading Notes</label>
                        <Textarea
                            placeholder="What was your thesis? What did you learn?"
                            value={entry.notes}
                            onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
                            className="bg-black/20 border-white/10 min-h-[100px] resize-none focus:ring-amber-500/20"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="hover:bg-white/5 text-zinc-400"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Journal
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

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
import { Sparkles, Brain, Save, Trash2, Smile, Frown, Meh, Rocket, Skull, HardDrive, Link as LinkIcon, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { googleDriveService } from "@/lib/google-drive";
import { journalClient, EntryType } from "@/lib/deriverse/journal-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn, signOut, useSession } from "next-auth/react";

interface TradingJournalProps {
    trade?: TradeHistory | null; // Optional now
    recentTrades?: TradeHistory[]; // List for selection
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
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

export function TradingJournal({ trade: initialTrade, recentTrades = [], open, onOpenChange, onSave }: TradingJournalProps) {
    const { publicKey, signTransaction, signAllTransactions } = useWallet();
    const { data: session } = useSession();
    const [selectedTrade, setSelectedTrade] = useState<TradeHistory | null>(initialTrade || null);
    const [entry, setEntry] = useState<JournalEntry>({ mood: "", notes: "", tags: [] });
    const [aiInsight, setAiInsight] = useState<string>("");

    // New State
    const [journalMode, setJournalMode] = useState<EntryType>(EntryType.OFFCHAIN);
    const [isSaving, setIsSaving] = useState(false);

    // Reset selected trade when dialog opens/closes or initialTrade changes
    useEffect(() => {
        if (open) {
            setSelectedTrade(initialTrade || null);
        }
    }, [open, initialTrade]);

    // Check Drive Connection (Simplified check)
    useEffect(() => {
        // In a real app we might check if token exists in storage or try a silent auth
        // For now, we rely on user action, but we could persist connection state
    }, []);

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

    // Load entry logic (Mock/Local for now, could be enhanced to fetch from Drive/Chain)
    useEffect(() => {
        if (open && selectedTrade) {
            generateInsight(selectedTrade);
            // TODO: Fetch existing entry
        }
    }, [selectedTrade, open]);


    const handleSave = async () => {
        setIsSaving(true);
        try {
            const currentEntry = {
                date: new Date().toISOString(),
                tradeId: selectedTrade?.orderId || "general",
                symbol: selectedTrade?.symbol || "GENERAL",
                side: selectedTrade?.side || "-",
                pnl: selectedTrade?.pnl?.toString() || "0",
                mood: entry.mood,
                notes: entry.notes,

                tags: entry.tags.join(","),
                type: journalMode === EntryType.HYBRID ? "HYBRID" : (journalMode === EntryType.OFFCHAIN ? "OFFCHAIN" : "ONCHAIN")
            };

            let dataToChain = JSON.stringify(currentEntry);

            // 1. Handle Drive Storage (Offchain & Hybrid)
            if (journalMode === EntryType.OFFCHAIN || journalMode === EntryType.HYBRID) {
                if (!session) {
                    signIn('google');
                    return;
                }
                const fileId = await googleDriveService.appendEntry(currentEntry);
                console.log("Saved to Drive, ID:", fileId);

                if (journalMode === EntryType.HYBRID) {
                    dataToChain = fileId; // In Hybrid, we store the ID on chain
                }
            }

            // 2. Handle Chain Storage (Onchain & Hybrid)
            if (journalMode === EntryType.ONCHAIN || journalMode === EntryType.HYBRID) {
                if (!publicKey) throw new Error("Wallet not connected");

                const tradeHash = selectedTrade?.orderId || "general_entry_" + Date.now(); // fallback

                const walletAdapter = {
                    publicKey,
                    signTransaction,
                    signAllTransactions
                };

                const tx = await journalClient.saveJournalOnChain(
                    walletAdapter,
                    dataToChain,
                    tradeHash,
                    journalMode
                );
                console.log("Saved on chain, TX:", tx);
            }

            toast.success("Journal Entry Saved!");
            if (onSave) onSave();
            onOpenChange(false);

            // Clear entry if general
            if (!selectedTrade) {
                setEntry({ mood: "", notes: "", tags: [] });
            }

        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "Failed to save journal");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSelectTrade = (tradeId: string) => {
        const t = recentTrades.find(r => r.orderId.toString() === tradeId);
        if (t) setSelectedTrade(t);
    };

    const activeTrade = selectedTrade;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] bg-card border-border max-h-[90vh] overflow-y-auto">
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
                            {!initialTrade && (
                                <button onClick={() => setSelectedTrade(null)} className="ml-2 text-xs text-muted-foreground hover:text-amber-400 underline">
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
                                <span className="text-sm text-zinc-500 font-mono">{new Date().toLocaleDateString()}</span>
                            </div>
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
                        {activeTrade ? <>PnL: <span className={cn("font-mono font-bold", (activeTrade.pnl || 0) >= 0 ? "text-green-400" : "text-red-400")}>${(activeTrade.pnl || 0).toFixed(2)}</span></> : "Log your thoughts."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Data Storage Mode */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Storage Mode</label>

                            {!session && (journalMode === EntryType.OFFCHAIN || journalMode === EntryType.HYBRID) && (
                                <Button variant="outline" size="sm" onClick={() => signIn('google')} className="h-7 text-xs gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 w-full sm:w-auto">
                                    <HardDrive className="w-3 h-3" /> Connect Drive
                                </Button>
                            )}

                            {session && (
                                <div className="flex flex-wrap items-center gap-2 bg-blue-500/5 px-2 py-1 rounded-md border border-blue-500/10">
                                    <div className="text-xs text-green-400 flex items-center gap-1 truncate max-w-[200px] sm:max-w-none">
                                        <HardDrive className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{session.user?.email}</span>
                                    </div>
                                    <div className="h-3 w-px bg-white/10 mx-1"></div>
                                    <button
                                        onClick={() => signOut()}
                                        className="text-[10px] text-red-400 hover:text-red-300 underline shrink-0"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            )}
                        </div>

                        <Tabs defaultValue="2" value={journalMode.toString()} onValueChange={(v) => setJournalMode(parseInt(v) as EntryType)} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 bg-black/40 h-auto p-1">
                                <TabsTrigger value="0" className="text-xs gap-1 sm:gap-2 py-2 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-center">
                                    <LinkIcon className="w-3 h-3 hidden sm:inline" /> On-Chain
                                </TabsTrigger>
                                <TabsTrigger value="1" className="text-xs gap-1 sm:gap-2 py-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-center">
                                    <Sparkles className="w-3 h-3 hidden sm:inline" /> Hybrid
                                </TabsTrigger>
                                <TabsTrigger value="2" className="text-xs gap-1 sm:gap-2 py-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-center">
                                    <HardDrive className="w-3 h-3 hidden sm:inline" /> <span className="hidden sm:inline">Off-Chain</span><span className="sm:hidden">Drive</span>
                                </TabsTrigger>
                            </TabsList>
                            <p className="text-[10px] text-zinc-500 mt-2 px-1 text-center sm:text-left">
                                {journalMode === EntryType.ONCHAIN && "Entry data is stored entirely on Solana. Persistent & Immutable. Gas fees apply."}
                                {journalMode === EntryType.HYBRID && "Metadata on-chain, content in Google Drive. Verifiable ownership with rich data."}
                                {journalMode === EntryType.OFFCHAIN && "Stored privately in your Google Drive. Free & fast. No blockchain transaction."}
                            </p>
                        </Tabs>
                    </div>

                    {/* AI Insight */}
                    {activeTrade && (
                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Brain className="w-12 h-12 text-blue-500" />
                            </div>
                            <div className="flex items-start gap-3 relative z-10">
                                <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="text-sm font-semibold text-blue-100">AI Analysis</h4>
                                    <p className="text-sm text-blue-200/80 leading-relaxed italic">"{aiInsight}"</p>
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
                                            "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all flex-1",
                                            isSelected ? `border-${m.color.split(' ')[0].split('-')[1]}-500 bg-white/5` : "border-transparent hover:bg-white/5",
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

                <div className="flex justify-between items-center gap-2">
                    <span className="text-[10px] text-zinc-600">
                        {session ? "Synced with Drive" : "Local / Unconnected"}
                    </span>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-white/5 text-zinc-400">Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2 min-w-[100px]">
                            {isSaving ? (
                                <>Saving...</>
                            ) : (
                                <> <Save className="w-4 h-4" /> Save Journal </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

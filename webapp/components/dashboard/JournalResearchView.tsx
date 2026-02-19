"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, BookOpen, Smile, Frown, Meh, Rocket, Skull, Loader2, Calendar, Tag, HardDrive, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { googleDriveService } from "@/lib/google-drive";
import { toast } from "sonner";
import { signIn, signOut, useSession } from "next-auth/react";
import { TradingJournal } from "./TradingJournal";
import { useDeriverseData } from "@/hooks/useDeriverseData";
import { journalClient } from "@/lib/deriverse/journal-client";
import { useWallet } from "@solana/wallet-adapter-react";

interface JournalEntry {
    date: string;
    tradeid: string;
    symbol: string;
    side: string;
    pnl: string;
    mood: string;
    notes: string;
    tags: string;
    type?: string;
}

const MOOD_ICONS: Record<string, any> = {
    happy: Smile,
    sad: Frown,
    meh: Meh,
    ape: Rocket,
    rekt: Skull,
};

export function JournalResearchView() {
    const { data: session } = useSession();
    const { publicKey } = useWallet();
    const { data: derivativeData } = useDeriverseData();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [moodFilter, setMoodFilter] = useState("ALL");
    const [sourceFilter, setSourceFilter] = useState("ALL");
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadEntries();
    }, [session, publicKey]);

    useEffect(() => {
        filterEntries();
    }, [searchQuery, moodFilter, sourceFilter, entries]);

    const loadEntries = async () => {
        setIsLoading(true);
        try {
            // Fetch from Drive and blockchain in parallel
            const [driveEntries, onChainAccounts] = await Promise.allSettled([
                session ? googleDriveService.listEntries() : Promise.resolve([]),
                publicKey && journalClient.isConfigured()
                    ? journalClient.getAllJournals(publicKey)
                    : Promise.resolve([]),
            ]);

            const drive: JournalEntry[] =
                driveEntries.status === 'fulfilled' ? driveEntries.value : [];

            // Map on-chain accounts to JournalEntry shape
            const onChain: JournalEntry[] = [];
            if (onChainAccounts.status === 'fulfilled') {
                for (const acc of onChainAccounts.value) {
                    const isHybrid = 'hybrid' in acc.entryType;

                    // HYBRID: data field is a Drive file ID — only show once Drive is connected
                    // (the Drive fetch above will already include the full entry)
                    if (isHybrid && !session) continue;

                    // ONCHAIN: data field is the full JSON entry
                    try {
                        const parsed = JSON.parse(acc.data) as Partial<JournalEntry>;
                        onChain.push({
                            date: parsed.date ?? new Date(Number(acc.timestamp) * 1000).toISOString(),
                            tradeid: parsed.tradeid ?? acc.tradeHash.toBase58(),
                            symbol: parsed.symbol ?? '',
                            side: parsed.side ?? '',
                            pnl: parsed.pnl ?? '0',
                            mood: parsed.mood ?? '',
                            notes: parsed.notes ?? acc.data,
                            tags: parsed.tags ?? '',
                            type: isHybrid ? 'HYBRID' : 'ONCHAIN',
                        });
                    } catch {
                        // data isn't JSON (e.g. old entry or Drive file ID) — skip
                        console.warn('[JournalResearchView] Could not parse on-chain data:', acc.data);
                    }
                }
            }

            // Merge: Drive entries take precedence; add on-chain entries not already in Drive
            const driveTradeIds = new Set(drive.map((e) => e.tradeid));
            const uniqueOnChain = onChain.filter((e) => !driveTradeIds.has(e.tradeid));
            setEntries([...drive, ...uniqueOnChain]);


            if (driveEntries.status === 'rejected') {
                const err = driveEntries.reason as Error;
                if (err.message === 'UNAUTHORIZED') {
                    toast.error('Drive session expired. Please reconnect.');
                    signOut();
                } else {
                    toast.error('Failed to load Drive journal entries.');
                }
            }
        } catch (error) {
            console.error('Failed to load journal:', error);
            toast.error('Failed to load journal entries.');
        } finally {
            setIsLoading(false);
        }
    };

    const filterEntries = () => {
        let filtered = [...entries];

        // Search Filter (Symbol, Notes, Tags)
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(e =>
                e.symbol.toLowerCase().includes(lowerQuery) ||
                e.notes.toLowerCase().includes(lowerQuery) ||
                e.tags.toLowerCase().includes(lowerQuery)
            );
        }

        // Mood Filter
        if (moodFilter !== "ALL") {
            filtered = filtered.filter(e => e.mood === moodFilter);
        }

        // Source Filter
        if (sourceFilter !== "ALL") {
            filtered = filtered.filter(e => e.type === sourceFilter);
        }

        setFilteredEntries(filtered);
    };

    // Removed early return !session to allow On-Chain fallback viewing (future)

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto px-4 md:px-0">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Journal Research</h1>
                    <p className="text-muted-foreground">Analyze your past trades and psychology.</p>
                </div>
                <Button onClick={() => setIsCreating(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                    <Plus className="w-4 h-4" />
                    <span className="hidden md:inline">New Entry</span>
                </Button>
            </div>

            {/* Filters Toolbar */}
            <div className="flex flex-col md:flex-row gap-3 items-center bg-card p-2 rounded-xl border border-border/50 shadow-sm backdrop-blur-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search symbol, notes, tags..."
                        className="pl-9 bg-muted/50 border-border h-10 focus-visible:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <Select value={moodFilter} onValueChange={setMoodFilter}>
                        <SelectTrigger className="bg-muted/50 border-border w-[140px] md:w-[160px] h-10">
                            <div className="flex items-center gap-2 truncate">
                                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                                <SelectValue placeholder="Mood" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Moods</SelectItem>
                            <SelectItem value="happy">Happy</SelectItem>
                            <SelectItem value="sad">Sad</SelectItem>
                            <SelectItem value="meh">Meh</SelectItem>
                            <SelectItem value="ape">Ape</SelectItem>
                            <SelectItem value="rekt">Rekt</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                        <SelectTrigger className="bg-muted/50 border-border w-[140px] md:w-[160px] h-10">
                            <div className="flex items-center gap-2 truncate">
                                <HardDrive className="w-4 h-4 text-muted-foreground shrink-0" />
                                <SelectValue placeholder="Source" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Sources</SelectItem>
                            <SelectItem value="OFFCHAIN">Off-Chain</SelectItem>
                            <SelectItem value="HYBRID">Hybrid</SelectItem>
                            <SelectItem value="ONCHAIN">On-Chain</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap px-2 hidden md:block">
                    {filteredEntries.length} results
                </div>
            </div>

            {/* Drive not connected — persistent banner regardless of entry count */}
            {!session && (
                <div className="flex items-center justify-between gap-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <div>
                        <p className="text-sm font-bold text-primary">Missing Off-Chain &amp; Hybrid entries?</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Connect Google Drive to view your Off-Chain and Hybrid journals.
                        </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => signIn('google')} className="shrink-0 gap-2 border-primary/20 text-primary hover:bg-primary/10">
                        <HardDrive className="w-3 h-3" /> Connect Drive
                    </Button>
                </div>
            )}

            {/* Grid Content */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : filteredEntries.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground space-y-4">
                    <BookOpen className="w-12 h-12 dashed mx-auto mb-4 opacity-50" />
                    <p>No journal entries found matching your criteria.</p>

                </div>
            ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {filteredEntries.map((entry, i) => {
                        const MoodIcon = MOOD_ICONS[entry.mood] || BookOpen;
                        const isWin = parseFloat(entry.pnl) >= 0;

                        return (
                            <div key={i} className="group relative bg-card hover:bg-card/80 border border-border/50 hover:border-primary/20 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 flex flex-col gap-4">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isWin ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            <MoodIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg text-card-foreground">{entry.symbol}</h3>
                                                {entry.type && (
                                                    <Badge variant="outline" className="text-[9px] h-4 px-1 py-0 border-border text-muted-foreground">
                                                        {entry.type}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className={`font-mono px-1.5 py-0.5 rounded ${entry.side === 'BUY' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {entry.side}
                                                </span>
                                                <span>•</span>
                                                <span className="font-mono">
                                                    {entry.date ? format(new Date(entry.date), "MMM dd, yyyy") : "-"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`text-right font-mono font-bold ${isWin ? 'text-green-500' : 'text-red-500'}`}>
                                        {isWin ? '+' : ''}{parseFloat(entry.pnl).toFixed(2)}
                                    </div>
                                </div>

                                {/* Notes Snippet */}
                                <div className="flex-1">
                                    <p className="text-sm text-foreground/80 line-clamp-3 bg-muted/50 p-3 rounded-lg border border-border/50 italic">
                                        "{entry.notes || "No notes provided."}"
                                    </p>
                                </div>

                                {/* Footer / Tags */}
                                <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-border/50">
                                    {entry.tags && entry.tags.split(',').filter(Boolean).map((tag, j) => (
                                        <Badge key={j} variant="secondary" className="text-[10px] px-2 h-5 bg-secondary/50 hover:bg-secondary text-secondary-foreground">
                                            #{tag.trim()}
                                        </Badge>
                                    ))}
                                    {(!entry.tags || entry.tags === "") && (
                                        <span className="text-[10px] text-muted-foreground italic">No tags</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}


            {/* Creation Dialog */}
            <TradingJournal
                open={isCreating}
                onOpenChange={setIsCreating}
                onSave={loadEntries}
                recentTrades={derivativeData?.trades || []}
            />
        </div>
    );
}

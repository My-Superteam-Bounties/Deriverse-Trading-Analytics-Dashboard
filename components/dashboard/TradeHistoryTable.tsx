"use client";

import React, { useState, useMemo } from "react";
import { useDeriverseData } from "@/hooks/useDeriverseData";
import { format } from "date-fns";
import {
    ChevronLeft,
    ChevronRight,
    Download,
    Filter,
    Search,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

// ... imports
import { TradingJournal } from "./TradingJournal";
import { BookOpen } from "lucide-react";
import { TradeHistory } from "@/lib/deriverse/client";

export function TradeHistoryTable() {
    const { data, isLoading } = useDeriverseData();
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTrade, setSelectedTrade] = useState<TradeHistory | null>(null);
    const [isJournalOpen, setIsJournalOpen] = useState(false);
    const itemsPerPage = 15;

    // ... (Memo logic stays same)
    const filteredTrades = useMemo(() => {
        if (!data || !data.trades.length) return [];

        return data.trades.filter((trade) => {
            const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === "ALL" ||
                (typeFilter === "SPOT" && !trade.symbol.includes("PERP") && !trade.symbol.includes("OPT")) ||
                (typeFilter === "PERP" && trade.symbol.includes("PERP")) ||
                (typeFilter === "OPTION" && trade.symbol.includes("OPT"));
            return matchesSearch && matchesType;
        });
    }, [data, searchTerm, typeFilter]);

    const totalPages = Math.ceil(filteredTrades.length / itemsPerPage);
    const paginatedTrades = filteredTrades.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleRowClick = (trade: TradeHistory) => {
        setSelectedTrade(trade);
        setIsJournalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <TradingJournal
                trade={selectedTrade}
                open={isJournalOpen}
                onOpenChange={setIsJournalOpen}
            />

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row justify-between gap-4 bg-card p-4 rounded-xl border border-border">
                {/* ... (Search Inputs - Keep Existing) ... */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search symbol..."
                            className="h-10 w-full pl-9 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <select
                            className="h-10 pl-3 pr-8 rounded-lg bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="ALL">All Types</option>
                            <option value="SPOT">Spot</option>
                            <option value="PERP">Perp</option>
                            <option value="OPTION">Option</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-4 py-3">Time</th>
                                <th className="px-4 py-3">Symbol</th>
                                <th className="px-4 py-3">Side</th>
                                <th className="px-4 py-3 text-right">Price</th>
                                <th className="px-4 py-3 text-right">Size</th>
                                <th className="px-4 py-3 text-right">Fee</th>
                                <th className="px-4 py-3 text-right">PnL</th>
                                <th className="px-4 py-3 w-[50px]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTrades.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                        No trades found
                                    </td>
                                </tr>
                            ) : (
                                paginatedTrades.map((trade, i) => (
                                    <tr
                                        key={i}
                                        onClick={() => handleRowClick(trade)}
                                        className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {format(trade.timestamp, "MMM dd, HH:mm")}
                                        </td>
                                        <td className="px-4 py-3 font-medium">{trade.symbol}</td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "px-2 py-1 rounded text-xs font-medium",
                                                trade.side === "BUY"
                                                    ? "bg-green-500/10 text-green-400"
                                                    : "bg-red-500/10 text-red-400"
                                            )}>
                                                {trade.side}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono">
                                            ${trade.price.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono">
                                            {trade.size.toFixed(4)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                                            ${trade.fee.toFixed(2)}
                                        </td>
                                        <td className={cn(
                                            "px-4 py-3 text-right font-mono font-medium",
                                            (trade.pnl || 0) >= 0 ? "text-green-400" : "text-red-400"
                                        )}>
                                            {trade.pnl ? `$${trade.pnl.toFixed(2)}` : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <BookOpen className="w-4 h-4 text-zinc-600 group-hover:text-amber-500 transition-colors opacity-0 group-hover:opacity-100" />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-t border-border">
                        <div className="text-sm text-muted-foreground">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTrades.length)} of {filteredTrades.length} trades
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-muted/50 border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-medium">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-muted/50 border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

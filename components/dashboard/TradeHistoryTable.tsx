"use client";

import React, { useState, useMemo } from "react";
import { MOCK_TRADES, Trade } from "@/lib/mock-data";
import { format } from "date-fns";
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Download,
    Filter,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

export function TradeHistoryTable() {
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const filteredTrades = useMemo(() => {
        return MOCK_TRADES.filter((trade) => {
            const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === "ALL" || trade.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [searchTerm, typeFilter]);

    const totalPages = Math.ceil(filteredTrades.length / itemsPerPage);
    const paginatedTrades = filteredTrades.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row justify-between gap-4 bg-card p-4 rounded-xl border border-border">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search symbol..."
                            className="h-10 w-full pl-9 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
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
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Symbol</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Side</th>
                                <th className="px-6 py-4 font-medium">Entry</th>
                                <th className="px-6 py-4 font-medium">Exit</th>
                                <th className="px-6 py-4 font-medium">Size</th>
                                <th className="px-6 py-4 font-medium">Fee</th>
                                <th className="px-6 py-4 font-medium text-right">PnL</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paginatedTrades.map((trade) => (
                                <tr key={trade.id} className="hover:bg-cyan-500/5 transition-colors">
                                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                        {trade.closeTime ? format(trade.closeTime, "MMM dd, yyyy HH:mm") : "-"}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-foreground">
                                        {trade.symbol}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2 py-1 rounded text-[10px] font-bold uppercase",
                                            trade.type === "PERP" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                                                trade.type === "OPTION" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                                    "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                        )}>
                                            {trade.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "font-medium",
                                            trade.side === "LONG" ? "text-green-400" : "text-red-400"
                                        )}>
                                            {trade.side}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        ${trade.entryPrice.toLocaleString(undefined, { maximumFractionDigits: 5 })}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {trade.exitPrice ? `$${trade.exitPrice.toLocaleString(undefined, { maximumFractionDigits: 5 })}` : "-"}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        ${trade.size.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        ${trade.fee.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium">
                                        <span className={cn(
                                            trade.pnl >= 0 ? "text-green-400" : "text-red-400"
                                        )}>
                                            {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 bg-muted/20 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, filteredTrades.length)}</span> of <span className="font-medium text-foreground">{filteredTrades.length}</span> results
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { PnLChart } from "@/components/dashboard/PnLChart";
import { RecentTrades } from "@/components/dashboard/RecentTrades";
import { PerformanceWidget } from "@/components/dashboard/PerformanceWidget";
import { WalletGuard } from "@/components/dashboard/WalletGuard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingState } from "@/components/dashboard/LoadingState";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DateRange, useDeriverseData } from "@/hooks/useDeriverseData";
import { Filter, PenLine, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TradingJournal } from "./TradingJournal";
import { DashboardOverviewDialog } from "./DashboardOverviewDialog";
import { useDeriverse } from "@/hooks/useDeriverse";


export function TerminalView() {
    const { publicKey } = useWallet();

    // State for Filters
    const [timeRange, setTimeRange] = useState<DateRange>("7d");
    const [selectedSymbol, setSelectedSymbol] = useState<string>("ALL");

    // Dialog State
    const [showJournal, setShowJournal] = useState(false);
    const [showOverview, setShowOverview] = useState(false);

    // Fetch Data with Filters
    // Fetch Data with Filters
    const { data: filteredData, isLoading } = useDeriverseData({
        dateRange: timeRange,
        symbol: selectedSymbol
    });

    // Also fetch "All" data just to get the list of symbols for the dropdown
    // This is a bit inefficient (double fetch) but clean. 
    // Optimization: returning 'instruments' or unique symbols from the hook even when filtered would be better.
    // For now, we'll extract unique symbols from the *filtered* data if "ALL" is selected, or just hardcode common ones + dynamic
    // Better yet, let's just use the 'instruments' list from the hook if available.

    const uniqueSymbols = useMemo(() => {
        if (!filteredData) return [];
        return Array.from(new Set(filteredData.trades.map(t => t.symbol)));
    }, [filteredData]);



    const { isInitialized } = useDeriverse();

    return (
        <WalletGuard>
            {!filteredData ? (
                <LoadingState />
            ) : filteredData.trades.length === 0 ? (
                <EmptyState walletAddress={publicKey?.toBase58()} />
            ) : (
                <div className="flex flex-col gap-8 animate-fade-in">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Trading Overview</h1>
                            <p className="text-muted-foreground text-sm">Welcome back, here is your portfolio performance.</p>
                        </div>

                        {/* Filter Toolbar */}
                        <div className="flex items-center gap-3">

                            {/* Quick Actions */}
                            <div className="flex items-center gap-2 bg-card/50 p-1.5 rounded-xl border border-white/5 backdrop-blur-sm mr-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10"
                                    onClick={() => setShowJournal(true)}
                                    title="Add Journal Entry"
                                >
                                    <PenLine className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10"
                                    onClick={() => setShowOverview(true)}
                                    title="Friendly Overview"
                                >
                                    <Sparkles className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-3 bg-card/50 p-1.5 rounded-xl border border-white/5 backdrop-blur-sm">
                                {/* Symbol Filter */}
                                <div className="w-[140px]">
                                    <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                                        <SelectTrigger className="h-9 bg-transparent border-transparent hover:bg-white/5 focus:ring-0 text-foreground font-medium">
                                            <div className="flex items-center gap-2">
                                                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                                                <SelectValue placeholder="Symbol" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Symbols</SelectItem>
                                            {uniqueSymbols.map(sym => (
                                                <SelectItem key={sym} value={sym}>{sym}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="h-4 w-px bg-white/10"></div>

                                {/* Date Filter */}
                                <div className="w-[140px]">
                                    <Select value={timeRange} onValueChange={(val: DateRange) => setTimeRange(val)}>
                                        <SelectTrigger className="h-9 bg-transparent border-transparent hover:bg-white/5 focus:ring-0 text-foreground font-medium">
                                            <SelectValue placeholder="Time Range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="7d">Last 7 Days</SelectItem>
                                            <SelectItem value="30d">Last 30 Days</SelectItem>
                                            <SelectItem value="all">All Time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Widgets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <SummaryCards data={filteredData} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Chart */}
                        <div className="card-gradient lg:col-span-2 min-h-[400px] rounded-2xl">
                            <PnLChart />
                        </div>

                        {/* Side Widget */}
                        <div className="card-gradient h-fit rounded-2xl p-6">
                            <PerformanceWidget />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="card-gradient rounded-2xl p-6">
                        <RecentTrades />
                    </div>
                </div>
            )}

            {/* Dialogs */}
            <TradingJournal
                open={showJournal}
                onOpenChange={setShowJournal}
                trade={null} // Default to null to trigger "Select Trade" mode
                recentTrades={filteredData?.trades || []}
            />

            <DashboardOverviewDialog
                open={showOverview}
                onOpenChange={setShowOverview}
                data={filteredData}
            />

        </WalletGuard>
    );
}

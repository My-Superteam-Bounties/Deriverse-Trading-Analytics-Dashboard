"use client";

import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { PnLChart } from "@/components/dashboard/PnLChart";
import { RecentTrades } from "@/components/dashboard/RecentTrades";
import { PerformanceWidget } from "@/components/dashboard/PerformanceWidget";

export function TerminalView() {
    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Trading Overview</h1>
                    <p className="text-muted-foreground text-sm">Welcome back, here is your portfolio performance.</p>
                </div>
                <div className="flex items-center gap-2">
                    <select className="bg-muted/50 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>All Time</option>
                    </select>
                </div>
            </div>

            {/* Placeholders for Dashboard Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCards />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="card-gradient lg:col-span-2 min-h-[400px] rounded-2xl">
                    <PnLChart />
                </div>

                {/* Side Widget */}
                <div className="card-gradient h-[400px] rounded-2xl p-6">
                    <PerformanceWidget />
                </div>
            </div>

            {/* Table */}
            <div className="card-gradient rounded-2xl p-6">
                <RecentTrades />
            </div>
        </div>
    );
}

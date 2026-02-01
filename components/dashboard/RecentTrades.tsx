"use client";

import { MOCK_TRADES } from "@/lib/mock-data";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function RecentTrades() {
    const trades = MOCK_TRADES.slice(0, 50); // Show last 50 trades

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Recent Trade History</h3>
                <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">View All</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Symbol</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Side</th>
                            <th className="px-4 py-3">Size</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">PnL</th>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3 rounded-r-lg"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {trades.map((trade) => (
                            <tr key={trade.id} className="hover:bg-muted/50 transition-colors group">
                                <td className="px-4 py-3 font-medium text-foreground">
                                    {trade.symbol}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                        trade.type === "PERP" ? "bg-purple-500/20 text-purple-400" :
                                            trade.type === "OPTION" ? "bg-amber-500/20 text-amber-400" :
                                                "bg-blue-500/20 text-blue-400"
                                    )}>
                                        {trade.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn(
                                        "font-medium",
                                        trade.side === "LONG" ? "text-green-400" : "text-red-400"
                                    )}>
                                        {trade.side}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    ${trade.size.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    ${trade.entryPrice.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 font-medium">
                                    <span className={cn(
                                        trade.pnl >= 0 ? "text-green-400" : "text-red-400"
                                    )}>
                                        {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {trade.closeTime ? format(trade.closeTime, "MMM dd HH:mm") : "-"}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

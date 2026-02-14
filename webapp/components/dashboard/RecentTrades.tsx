"use client";

import { useDeriverseData } from "@/hooks/useDeriverseData";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export function RecentTrades() {
    const { data, isLoading } = useDeriverseData();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    const trades = data?.trades.slice(0, 50) || [];

    if (!trades.length) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">No trades found</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-lg font-bold mb-4">Recent Trades</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/50">
                            <th className="text-left py-3 px-2 text-muted-foreground font-medium">Time</th>
                            <th className="text-left py-3 px-2 text-muted-foreground font-medium">Symbol</th>
                            <th className="text-left py-3 px-2 text-muted-foreground font-medium">Side</th>
                            <th className="text-right py-3 px-2 text-muted-foreground font-medium">Price</th>
                            <th className="text-right py-3 px-2 text-muted-foreground font-medium">Size</th>
                            <th className="text-right py-3 px-2 text-muted-foreground font-medium">PnL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trades.map((trade, i) => (
                            <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                                <td className="py-3 px-2 text-muted-foreground">
                                    {format(trade.timestamp, "MMM dd, HH:mm")}
                                </td>
                                <td className="py-3 px-2 font-medium">{trade.symbol}</td>
                                <td className="py-3 px-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${trade.side === "BUY"
                                            ? "bg-green-500/10 text-green-400"
                                            : "bg-red-500/10 text-red-400"
                                        }`}>
                                        {trade.side}
                                    </span>
                                </td>
                                <td className="py-3 px-2 text-right font-mono">
                                    ${trade.price.toFixed(2)}
                                </td>
                                <td className="py-3 px-2 text-right font-mono">
                                    {trade.size.toFixed(4)}
                                </td>
                                <td className={`py-3 px-2 text-right font-mono font-medium ${(trade.pnl || 0) >= 0 ? "text-green-400" : "text-red-400"
                                    }`}>
                                    {trade.pnl ? `$${trade.pnl.toFixed(2)}` : "-"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

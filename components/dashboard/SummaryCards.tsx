"use client";

import { useTradeMetrics } from "@/hooks/useTradeMetrics";
import { DollarSign, BarChart3, Target, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function SummaryCards() {
    const { totalPnL, totalVolume, tradeCount, winRate } = useTradeMetrics();

    const cards = [
        {
            label: "Total PnL",
            value: `$${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: DollarSign,
            trend: totalPnL >= 0 ? "+12.5%" : "-2.3%",
            status: totalPnL >= 0 ? "success" : "danger",
        },
        {
            label: "Trading Volume",
            value: `$${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            icon: BarChart3,
            trend: "+5.2%",
            status: "neutral",
        },
        {
            label: "Win Rate",
            value: `${winRate.toFixed(1)}%`,
            icon: Target,
            trend: winRate > 50 ? "High" : "Low",
            status: winRate > 50 ? "success" : "warning",
        },
        {
            label: "Total Trades",
            value: tradeCount,
            icon: Activity,
            trend: "+8 today",
            status: "neutral",
        },
    ];

    return (
        <>
            {cards.map((card, i) => (
                <div
                    key={i}
                    className="card-gradient p-5 rounded-2xl shadow-xl transition-all group hover:-translate-y-1 hover:shadow-2xl"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className={cn(
                            "p-2 rounded-lg bg-opacity-10",
                            card.status === "success" ? "bg-green-500 text-green-400" :
                                card.status === "danger" ? "bg-red-500 text-red-400" :
                                    card.status === "warning" ? "bg-yellow-500 text-yellow-400" :
                                        "bg-blue-500 text-cyan-400"
                        )}>
                            <card.icon className="h-5 w-5" />
                        </div>
                        <span className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full bg-opacity-10",
                            card.status === "success" ? "bg-green-500 text-green-400" :
                                card.status === "danger" ? "bg-red-500 text-red-400" :
                                    "bg-muted text-muted-foreground"
                        )}>
                            {card.trend}
                        </span>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-sm font-medium">{card.label}</p>
                        <h3 className={cn(
                            "text-2xl font-bold mt-1",
                            card.label === "Total PnL" ? (totalPnL >= 0 ? "text-green-500" : "text-destructive") : "text-foreground"
                        )}>
                            {card.value}
                        </h3>
                    </div>
                </div>
            ))}
        </>
    );
}

"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Target } from "lucide-react";
interface SummaryCardsProps {
    data: {
        totalPnL: number;
        totalVolume: number;
        totalTrades: number;
        winRate: number;
    } | null;
}

export function SummaryCards({ data }: SummaryCardsProps) {
    // Default values if no data
    const totalPnL = data?.totalPnL || 0;
    const totalVolume = data?.totalVolume || 0;
    const tradeCount = data?.totalTrades || 0;
    const winRate = data?.winRate || 0;

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
                            "p-2 rounded-lg",
                            card.status === "success" ? "bg-emerald-500/10 text-emerald-400" :
                                card.status === "danger" ? "bg-rose-500/10 text-rose-400" :
                                    card.status === "warning" ? "bg-amber-500/10 text-amber-400" :
                                        "bg-blue-500/10 text-blue-400"
                        )}>
                            <card.icon className="h-5 w-5" />
                        </div>
                        <span className={cn(
                            "text-xs font-bold px-2 py-1 rounded-full",
                            card.status === "success" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" :
                                card.status === "danger" ? "bg-rose-500/20 text-rose-400 border border-rose-500/20" :
                                    "bg-zinc-500/20 text-zinc-400 border border-zinc-500/20"
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

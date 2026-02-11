"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis, XAxis, Tooltip } from "recharts";
import { TradeHistory } from "@/lib/deriverse/client";
import { format } from "date-fns";

interface OverviewChartProps {
    trades: TradeHistory[];
}

export function OverviewChart({ trades }: OverviewChartProps) {
    const data = useMemo(() => {
        if (!trades || trades.length === 0) return [];

        // Sort trades by date ascending
        const sortedTrades = [...trades].sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        let cumulativePnL = 0;
        return sortedTrades.map(trade => {
            cumulativePnL += (trade.pnl || 0);
            return {
                date: trade.timestamp,
                pnl: cumulativePnL,
                dateStr: format(new Date(trade.timestamp), "MMM d")
            };
        });
    }, [trades]);

    if (data.length === 0) {
        return (
            <div className="h-[200px] w-full flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                No trading data available for chart
            </div>
        );
    }

    const isPositive = data[data.length - 1].pnl >= 0;
    const color = isPositive ? "#10b981" : "#f43f5e"; // Emerald or Rose

    return (
        <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="dateStr"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#71717a', fontSize: 10 }}
                        minTickGap={30}
                    />
                    <YAxis
                        hide={true}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-zinc-950 border border-white/10 p-2 rounded-lg shadow-xl text-xs">
                                        <div className="text-zinc-400 mb-1">{payload[0].payload.dateStr}</div>
                                        <div className={`font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            ${(payload[0].value as number).toLocaleString()}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="pnl"
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPnL)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

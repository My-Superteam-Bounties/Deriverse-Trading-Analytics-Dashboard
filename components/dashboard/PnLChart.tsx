"use client";

import { useMemo } from "react";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";
import { format } from "date-fns";
import { MOCK_TRADES } from "@/lib/mock-data";

export function PnLChart() {
    const data = useMemo(() => {
        // Sort trades by close time ascending for chart
        const sortedTrades = [...MOCK_TRADES]
            .filter(t => t.closeTime)
            .sort((a, b) => (a.closeTime!.getTime() - b.closeTime!.getTime()));

        let cumulativePnL = 0;
        const chartData = sortedTrades.map((t) => {
            cumulativePnL += t.pnl;
            return {
                date: t.closeTime,
                pnl: cumulativePnL,
                rawPnL: t.pnl,
            };
        });

        // Downsample if too many points? For now, just take all.
        return chartData;
    }, []);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#09090b] border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
                    <p className="text-muted-foreground text-xs mb-1">
                        {label ? format(new Date(label), "MMM dd, HH:mm") : ""}
                    </p>
                    <p className="text-foreground font-bold text-sm">
                        ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-full w-full p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-foreground">Cumulative PnL</h3>
                <div className="flex gap-2">
                    <span className="text-xs text-green-400 font-medium bg-green-500/10 px-2 py-1 rounded-full">
                        All Time High
                    </span>
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(date) => format(new Date(date), "MMM dd")}
                            stroke="#52525b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            stroke="#52525b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="pnl"
                            stroke="#06b6d4"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorPnL)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

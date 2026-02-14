"use client";

import { useMemo } from "react";
import { useDeriverseData } from "@/hooks/useDeriverseData";
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
import { Loader2 } from "lucide-react";

export function PnLChart() {
    const { data, isLoading } = useDeriverseData();

    const chartData = useMemo(() => {
        if (!data || !data.trades.length) return [];

        // Sort trades by timestamp
        const sortedTrades = [...data.trades]
            .filter(t => t.timestamp)
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        let cumulativePnL = 0;
        return sortedTrades.map((t) => {
            cumulativePnL += t.pnl || 0;
            return {
                date: t.timestamp,
                pnl: cumulativePnL,
                rawPnL: t.pnl || 0,
            };
        });
    }, [data]);

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

    if (isLoading) {
        return (
            <div className="h-full w-full p-4 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    if (!chartData.length) {
        return (
            <div className="h-full w-full p-4 flex items-center justify-center">
                <p className="text-muted-foreground">No trading data available</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-foreground">Cumulative PnL</h3>
                <div className="flex gap-2">
                    <span className="text-xs text-green-400 font-medium bg-green-500/10 px-2 py-1 rounded-full">
                        Live Data
                    </span>
                </div>
            </div>
            <div className="h-[300px] w-full overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(date) => format(new Date(date), "MMM dd")}
                            stroke="#71717a"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            stroke="#71717a"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                            width={60}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="pnl"
                            stroke="#f59e0b"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorPnL)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

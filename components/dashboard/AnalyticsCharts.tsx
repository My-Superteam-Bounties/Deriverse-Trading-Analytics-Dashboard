"use client";

import { useMemo } from "react";
import { useDeriverseData } from "@/hooks/useDeriverseData";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend
} from "recharts";
import { Loader2 } from "lucide-react";

export function FeeBreakdownChart() {
    const { data, isLoading } = useDeriverseData();

    const chartData = useMemo(() => {
        if (!data || !data.trades.length) {
            return [
                { name: "Spot", value: 0, color: "#f59e0b" },
                { name: "Perp", value: 0, color: "#f97316" },
                { name: "Options", value: 0, color: "#fb923c" },
            ];
        }

        let spotFees = 0, perpFees = 0, optionFees = 0;
        data.trades.forEach(t => {
            // Categorize by symbol pattern or default to spot
            if (t.symbol.includes("PERP")) perpFees += t.fee;
            else if (t.symbol.includes("OPT")) optionFees += t.fee;
            else spotFees += t.fee;
        });

        return [
            { name: "Spot", value: spotFees, color: "#f59e0b" },
            { name: "Perp", value: perpFees, color: "#f97316" },
            { name: "Options", value: optionFees, color: "#fb923c" },
        ];
    }, [data]);

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px" }}
                        itemStyle={{ color: "#fff" }}
                        formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export function LongShortPerformanceChart() {
    const { data, isLoading } = useDeriverseData();

    const chartData = useMemo(() => {
        if (!data || !data.trades.length) {
            return [
                { name: "Long PnL", value: 0 },
                { name: "Short PnL", value: 0 },
            ];
        }

        let longPnL = 0, shortPnL = 0;
        data.trades.forEach(t => {
            if (t.side === "BUY") longPnL += t.pnl || 0;
            else shortPnL += t.pnl || 0;
        });

        return [
            { name: "Long PnL", value: longPnL },
            { name: "Short PnL", value: shortPnL },
        ];
    }, [data]);

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px" }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, "PnL"]}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.value >= 0 ? "#22c55e" : "#ef4444"} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function TimeOfDayHeatmap() {
    const { data, isLoading } = useDeriverseData();

    const chartData = useMemo(() => {
        const hours = new Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 }));

        if (data && data.trades.length) {
            data.trades.forEach(t => {
                const h = t.timestamp.getHours();
                hours[h].count++;
            });
        }

        return hours;
    }, [data]);

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis
                        dataKey="hour"
                        stroke="#71717a"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(h) => `${h}:00`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px" }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar dataKey="count" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function PnLDistributionChart() {
    const { data, isLoading } = useDeriverseData();

    const chartData = useMemo(() => {
        const buckets: Record<string, number> = {
            "Big Loss": 0, "Loss": 0, "Small Loss": 0,
            "Small Win": 0, "Win": 0, "Big Win": 0
        };

        if (data && data.trades.length) {
            data.trades.forEach(t => {
                const pnl = t.pnl || 0;
                if (pnl < -100) buckets["Big Loss"]++;
                else if (pnl < -10) buckets["Loss"]++;
                else if (pnl < 0) buckets["Small Loss"]++;
                else if (pnl < 10) buckets["Small Win"]++;
                else if (pnl < 100) buckets["Win"]++;
                else buckets["Big Win"]++;
            });
        }

        return Object.entries(buckets).map(([name, count]) => ({ name, count }));
    }, [data]);

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px" }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name.includes("Loss") ? "#ef4444" : "#22c55e"} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

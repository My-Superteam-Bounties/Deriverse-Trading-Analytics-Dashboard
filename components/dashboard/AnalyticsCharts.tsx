"use client";

import { useMemo } from "react";
import { MOCK_TRADES } from "@/lib/mock-data";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend
} from "recharts";

export function FeeBreakdownChart() {
    const data = useMemo(() => {
        let spotFees = 0, perpFees = 0, optionFees = 0;
        MOCK_TRADES.forEach(t => {
            if (t.type === "SPOT") spotFees += t.fee;
            else if (t.type === "PERP") perpFees += t.fee;
            else optionFees += t.fee;
        });
        return [
            { name: "Spot", value: spotFees, color: "#3b82f6" },
            { name: "Perp", value: perpFees, color: "#a855f7" },
            { name: "Options", value: optionFees, color: "#f59e0b" },
        ];
    }, []);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
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
    );
}

export function LongShortPerformanceChart() {
    const data = useMemo(() => {
        let longPnL = 0, shortPnL = 0;
        MOCK_TRADES.forEach(t => {
            if (t.side === "LONG") longPnL += t.pnl;
            else shortPnL += t.pnl;
        });
        return [
            { name: "Long PnL", value: longPnL },
            { name: "Short PnL", value: shortPnL },
        ];
    }, []);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                    contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px" }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "PnL"]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value >= 0 ? "#22c55e" : "#ef4444"} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

export function TimeOfDayHeatmap() {
    // Simplified as a Bar chart for now to show "Activity by Hour"
    const data = useMemo(() => {
        const hours = new Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 }));
        MOCK_TRADES.forEach(t => {
            const h = t.openTime.getHours();
            hours[h].count++;
        });
        return hours;
    }, []);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <XAxis
                    dataKey="hour"
                    stroke="#52525b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(h) => `${h}:00`}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px" }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[2, 2, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

export function PnLDistributionChart() {
    // Histogram of PnL buckets
    const data = useMemo(() => {
        const buckets: Record<string, number> = {
            "Big Loss": 0, "Loss": 0, "Small Loss": 0,
            "Small Win": 0, "Win": 0, "Big Win": 0
        };

        MOCK_TRADES.forEach(t => {
            if (t.pnl < -100) buckets["Big Loss"]++;
            else if (t.pnl < -10) buckets["Loss"]++;
            else if (t.pnl < 0) buckets["Small Loss"]++;
            else if (t.pnl < 10) buckets["Small Win"]++;
            else if (t.pnl < 100) buckets["Win"]++;
            else buckets["Big Win"]++;
        });

        return Object.entries(buckets).map(([name, count]) => ({ name, count }));
    }, []);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                    contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px" }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name.includes("Loss") ? "#ef4444" : "#22c55e"} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

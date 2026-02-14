"use client";

import { useMemo } from "react";
import { useDeriverseData } from "@/hooks/useDeriverseData";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Loader2 } from "lucide-react";

export function PerformanceWidget() {
    const { data, isLoading } = useDeriverseData();

    const metrics = useMemo(() => {
        if (!data || !data.trades.length) {
            return {
                profitFactor: 0,
                avgWin: 0,
                avgLoss: 0,
                longWins: 0,
                shortWins: 0,
                pieData: [
                    { name: "Longs", value: 0, color: "#22c55e" },
                    { name: "Shorts", value: 0, color: "#ef4444" },
                ],
            };
        }

        let longWins = 0, longLosses = 0, shortWins = 0, shortLosses = 0;
        let winningPnL = 0, losingPnL = 0;

        data.trades.forEach(t => {
            const pnl = t.pnl || 0;
            if (t.side === "BUY") {
                if (pnl > 0) longWins++; else longLosses++;
            } else {
                if (pnl > 0) shortWins++; else shortLosses++;
            }

            if (pnl > 0) winningPnL += pnl;
            else losingPnL += Math.abs(pnl);
        });

        const totalWins = longWins + shortWins;
        const totalLosses = longLosses + shortLosses;

        const profitFactor = losingPnL > 0 ? winningPnL / losingPnL : winningPnL;
        const avgWin = totalWins > 0 ? winningPnL / totalWins : 0;
        const avgLoss = totalLosses > 0 ? losingPnL / totalLosses : 0;

        const pieData = [
            { name: "Longs", value: longWins + longLosses, color: "#22c55e" },
            { name: "Shorts", value: shortWins + shortLosses, color: "#ef4444" },
        ];

        return {
            profitFactor,
            avgWin,
            avgLoss,
            longWins,
            shortWins,
            pieData
        };
    }, [data]);

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Performance</h3>
                <span className="text-xs text-slate-500">Live Data</span>
            </div>

            <div className="space-y-4 flex-1">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <p className="text-slate-400 text-xs mb-1">Profit Factor</p>
                        <p className="text-xl font-bold text-white">{metrics.profitFactor.toFixed(2)}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <p className="text-slate-400 text-xs mb-1">Avg Win/Loss</p>
                        <p className="text-xl font-bold text-white">{(metrics.avgWin / (metrics.avgLoss || 1)).toFixed(2)}</p>
                    </div>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Avg Win</span>
                        <span className="text-emerald-400 font-bold font-mono">+${metrics.avgWin.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Avg Loss</span>
                        <span className="text-rose-400 font-bold font-mono">-${metrics.avgLoss.toFixed(2)}</span>
                    </div>
                </div>

                {/* Simple Distribution Chart */}
                <div className="h-40 w-full relative overflow-hidden">
                    <p className="absolute top-0 left-0 text-xs text-slate-500">Directional Bias</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={metrics.pieData}
                                innerRadius={30}
                                outerRadius={50}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {metrics.pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px" }}
                                itemStyle={{ color: "#fff" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-2 w-full flex justify-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Longs
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Shorts
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

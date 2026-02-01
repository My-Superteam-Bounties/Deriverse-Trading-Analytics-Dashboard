import { useMemo } from "react";
import { MOCK_TRADES } from "@/lib/mock-data";

export function useTradeMetrics() {
    const trades = MOCK_TRADES;

    const metrics = useMemo(() => {
        let totalPnL = 0;
        let totalVolume = 0;
        let wins = 0;
        let losses = 0;
        let totalDuration = 0;

        trades.forEach((t) => {
            totalPnL += t.pnl;
            totalVolume += t.size;

            if (t.pnl > 0) wins++;
            else losses++;

            // Duration (approx if closeTime exists)
            if (t.closeTime) {
                totalDuration += t.closeTime.getTime() - t.openTime.getTime();
            }
        });

        const tradeCount = trades.length;
        const winRate = tradeCount > 0 ? (wins / tradeCount) * 100 : 0;
        const avgDurationMs = tradeCount > 0 ? totalDuration / tradeCount : 0;
        const avgDurationHrs = avgDurationMs / (1000 * 60 * 60);

        return {
            totalPnL,
            totalVolume,
            tradeCount,
            winRate,
            wins,
            losses,
            avgDurationHrs
        };
    }, [trades]);

    return metrics;
}

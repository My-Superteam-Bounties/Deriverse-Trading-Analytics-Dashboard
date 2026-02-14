import { useMemo } from "react";
import { useDeriverseData } from "./useDeriverseData";

export function useTradeMetrics() {
    const { data, isLoading } = useDeriverseData();

    const metrics = useMemo(() => {
        if (!data) {
            return {
                totalPnL: 0,
                totalVolume: 0,
                tradeCount: 0,
                winRate: 0,
            };
        }

        return {
            totalPnL: data.totalPnL,
            totalVolume: data.totalVolume,
            tradeCount: data.totalTrades,
            winRate: data.winRate,
        };
    }, [data]);

    return {
        ...metrics,
        isLoading,
    };
}

import { useState, useEffect } from 'react';
import { useDeriverse } from './useDeriverse';
import { useWalletStore } from '@/lib/wallet-store';
import type { InstrumentData, UserPosition, TradeHistory } from '@/lib/deriverse/client';
import { isAfter, startOfDay, subDays } from 'date-fns';

export interface DashboardMetrics {
    totalPnL: number;
    realizedPnL: number;
    unrealizedPnL: number;
    totalVolume: number;
    winRate: number;
    totalTrades: number;
    avgTradeDuration: number;
    longShortRatio: number;
    largestWin: number;
    largestLoss: number;
    avgWin: number;
    avgLoss: number;
    positions: UserPosition[];
    trades: TradeHistory[];
    instruments: InstrumentData[];
}

export type DateRange = '7d' | '30d' | 'all';

export function useDeriverseData(filters?: { dateRange?: DateRange; symbol?: string }) {
    const { client, isInitialized } = useDeriverse();
    const { isConnected } = useWalletStore();

    const [data, setData] = useState<DashboardMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            if (!isConnected || !isInitialized || !client) {
                setData(null);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Fetch all data
                const [positions, allTrades, instruments] = await Promise.all([
                    client.getUserPositions().catch(() => []),
                    client.getTradeHistory(100).catch(() => []),
                    client.getAvailableInstruments().catch(() => []),
                ]);

                // --- Apply Filters ---
                let filteredTrades = allTrades;

                // 1. Symbol Filter
                if (filters?.symbol && filters.symbol !== 'ALL') {
                    filteredTrades = filteredTrades.filter(t => t.symbol === filters.symbol);
                }

                // 2. Date Filter
                if (filters?.dateRange && filters.dateRange !== 'all') {
                    const now = new Date();
                    const days = filters.dateRange === '7d' ? 7 : 30;
                    const cutoff = startOfDay(subDays(now, days));
                    filteredTrades = filteredTrades.filter(t => isAfter(new Date(t.timestamp), cutoff));
                }

                // --- Recalculate Metrics based on Filtered Data ---
                // Note: Realized PnL comes from trades, Unrealized from positions.
                // We only filter trades for now. Positions are generally "current" state.

                const unrealizedPnL = positions.reduce((sum, pos) => sum + (pos.pnl || 0), 0);
                const realizedPnL = filteredTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
                const totalPnL = unrealizedPnL + realizedPnL;

                // 2. Volume & Win Rate
                const totalVolume = filteredTrades.reduce((sum, trade) => sum + (trade.price * trade.size), 0);
                const winningTrades = filteredTrades.filter(t => (t.pnl ?? 0) > 0);
                const losingTrades = filteredTrades.filter(t => (t.pnl ?? 0) <= 0);
                const winRate = filteredTrades.length > 0 ? (winningTrades.length / filteredTrades.length) * 100 : 0;

                // 3. Advanced Metrics
                const largestWin = winningTrades.reduce((max, t) => Math.max(max, t.pnl || 0), 0);
                const largestLoss = losingTrades.reduce((min, t) => Math.min(min, t.pnl || 0), 0);

                const avgWin = winningTrades.length > 0
                    ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length
                    : 0;

                const avgLoss = losingTrades.length > 0
                    ? losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length
                    : 0;

                // Long/Short Ratio (Simplified based on side)
                const longCount = filteredTrades.filter(t => t.side === 'BUY').length;
                const shortCount = filteredTrades.filter(t => t.side === 'SELL').length;
                const longShortRatio = shortCount > 0 ? longCount / shortCount : longCount > 0 ? 100 : 0;

                // Avg Duration (Mock simulation since API doesn't return exit time yet)
                // In a real app, match OrderID to TradeID. For now, we simulate ~45 mins avg.
                const avgTradeDuration = 45 * 60 * 1000;

                setData({
                    totalPnL,
                    realizedPnL,
                    unrealizedPnL,
                    totalVolume,
                    winRate,
                    totalTrades: filteredTrades.length,
                    avgTradeDuration,
                    longShortRatio,
                    largestWin,
                    largestLoss,
                    avgWin,
                    avgLoss,
                    positions,
                    trades: filteredTrades, // Return filtered trades
                    instruments,
                });
            } catch (err) {
                console.error('Failed to fetch Deriverse data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load trading data');
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [client, isInitialized, isConnected, filters?.dateRange, filters?.symbol]); // Re-run on filter change

    return {
        data,
        isLoading,
        error,
        isConnected,
        isInitialized,
    };
}

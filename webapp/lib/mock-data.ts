import { addDays, subDays } from "date-fns";

export type TradeType = "SPOT" | "PERP" | "OPTION";
export type Side = "LONG" | "SHORT";
export type OrderType = "MARKET" | "LIMIT" | "STOP_LOSS" | "TAKE_PROFIT";
export type Status = "OPEN" | "CLOSED";

export interface Trade {
    id: string;
    symbol: string;
    type: TradeType;
    side: Side;
    status: Status;
    entryPrice: number;
    exitPrice: number | null;
    size: number;
    leverage: number;
    pnl: number;
    fee: number;
    openTime: Date;
    closeTime: Date | null;
    orderType: OrderType;
    notes?: string;
}

export interface Metric {
    label: string;
    value: string | number;
    change?: number;
    trend?: "up" | "down" | "neutral";
}

const SYMBOLS = ["SOL-ERP", "BTC-PERP", "ETH-PERP", "JUP-SPOT", "BONK-SPOT", "SOL-CALL-200", "BTC-PUT-50000"];

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomFloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

// Generate realistic mock trades
export function generateMockTrades(count: number = 200): Trade[] {
    const trades: Trade[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const isWin = Math.random() > 0.45; // 55% win rate
        const type = Math.random() > 0.3 ? "PERP" : Math.random() > 0.5 ? "SPOT" : "OPTION";
        const side = Math.random() > 0.5 ? "LONG" : "SHORT";
        const symbol = SYMBOLS[randomInt(0, SYMBOLS.length - 1)];
        const openTime = subDays(now, randomInt(0, 90)); // Past 90 days

        // Simulate duration (scalps to swings)
        const durationMinutes = randomInt(5, 4000);
        const closeTime = addDays(openTime, durationMinutes / 1440);

        let entryPrice = 0;
        if (symbol.includes("BTC")) entryPrice = randomFloat(40000, 65000);
        else if (symbol.includes("ETH")) entryPrice = randomFloat(2200, 3500);
        else if (symbol.includes("SOL")) entryPrice = randomFloat(80, 200);
        else entryPrice = randomFloat(0.1, 10);

        const size = randomFloat(100, 10000); // Position size in USD
        const leverage = type === "SPOT" ? 1 : randomInt(1, 20);

        // Calculate PnL
        let pnlPercent = 0;
        if (isWin) {
            pnlPercent = randomFloat(0.05, 1.5); // 5% to 150% gain
        } else {
            pnlPercent = randomFloat(-0.05, -0.8); // 5% to 80% loss
        }

        // Side calculations for PnL
        // Simplified: PnL is just size * percentage
        const pnl = size * pnlPercent;

        // Exit price derivation (approx)
        // Long: Exit = Entry * (1 + pnl%)
        // Short: Exit = Entry * (1 - pnl%)
        let exitPrice = 0;
        if (side === "LONG") {
            exitPrice = entryPrice * (1 + (pnlPercent / leverage));
        } else {
            exitPrice = entryPrice * (1 - (pnlPercent / leverage));
        }

        const fee = size * 0.0006; // 0.06% fees

        trades.push({
            id: `TRD-${randomInt(10000, 99999)}`,
            symbol,
            type,
            side,
            status: "CLOSED", // mostly closed for history
            entryPrice,
            exitPrice,
            size,
            leverage,
            pnl,
            fee,
            openTime,
            closeTime,
            orderType: Math.random() > 0.7 ? "LIMIT" : "MARKET",
        });
    }

    // Sort by close time descending
    return trades.sort((a, b) => (b.closeTime?.getTime() || 0) - (a.closeTime?.getTime() || 0));
}

export const MOCK_TRADES = generateMockTrades(350);

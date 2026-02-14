import '@/lib/polyfill';
import { Engine } from '@deriverse/kit';
import {
    address,
    createSolanaRpc,
    createSolanaRpcSubscriptions_UNSTABLE,
    devnet,
    Address,
} from '@solana/kit';
import { PublicKey, Connection } from '@solana/web3.js';
import { DERIVERSE_CONFIG } from './config';

export interface InstrumentData {
    instrId: number;
    symbol: string;
    lastPrice: number;
    bestBid: number;
    bestAsk: number;
    volume24h: number;
    priceChange24h: number;
}

export interface UserPosition {
    instrId: number;
    symbol: string;
    side: 'LONG' | 'SHORT';
    size: number;
    entryPrice: number;
    currentPrice: number;
    pnl: number;
    pnlPercent: number;
}

export interface TradeHistory {
    orderId: string;
    instrId: number;
    symbol: string;
    side: 'BUY' | 'SELL';
    price: number;
    size: number;
    timestamp: Date;
    fee: number;
    pnl?: number;
}

/**
 * DeriverseAnalyticsClient - Production-ready client for fetching analytics data
 * This client is READ-ONLY and focuses on data aggregation for the dashboard
 */
export class DeriverseAnalyticsClient {
    private engine: Engine | null = null;
    private rpc: ReturnType<typeof createSolanaRpc>;
    private rpcSubscriptions: ReturnType<typeof createSolanaRpcSubscriptions_UNSTABLE>;
    private signerAddress: Address | null = null;
    private isInitialized = false;

    constructor() {
        // Debug Config Loading (Scrubbed)
        const scrubbedRpc = DERIVERSE_CONFIG.rpcUrl.replace(/api-key=[^&]+/, 'api-key=********');

        console.log('[DeriverseClient] Config Loading:', {
            rpcUrl: scrubbedRpc,
            programId: DERIVERSE_CONFIG.programId,
            isTesting: DERIVERSE_CONFIG.isTesting
        });

        if (DERIVERSE_CONFIG.rpcUrl.includes('api.devnet.solana.com')) {
            console.warn('[DeriverseClient] WARNING: Using public/rate-limited RPC. Connection may be unstable.');
        }

        this.rpc = createSolanaRpc(devnet(DERIVERSE_CONFIG.rpcUrl));
        this.rpcSubscriptions = createSolanaRpcSubscriptions_UNSTABLE(devnet(DERIVERSE_CONFIG.wsUrl));
    }

    async initialize(walletAddress: string) {
        // Check Testing Mode FIRST
        if (DERIVERSE_CONFIG.isTesting) {
            console.log('[DeriverseClient] TESTING MODE ENABLED: Initializing Mock Environment');
            this.isInitialized = true;
            this.signerAddress = address(walletAddress);
            return { success: true, clientId: BigInt(123456789) };
        }

        // ... Real Initialization Logic ...
        if (this.isInitialized) {
            return { success: true, clientId: this.engine?.originalClientId };
        }

        try {
            const programId = address(DERIVERSE_CONFIG.programId);
            this.signerAddress = address(walletAddress);

            this.engine = new Engine(this.rpc, {
                programId: programId,
                version: Number(process.env.NEXT_PUBLIC_DERIVERSE_VERSION || '1')
            });

            await this.engine.initialize();
            await this.engine.setSigner(this.signerAddress);

            this.isInitialized = true;

            return {
                success: true,
                clientId: this.engine.originalClientId,
            };
        } catch (error) {
            console.error('Failed to initialize Deriverse Engine:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * MOCK DATA GENERATORS
     */
    private generateMockTradeHistory(): TradeHistory[] {
        const trades: TradeHistory[] = [];
        const baseTime = new Date().getTime();
        const symbols = ['SOL/USD', 'BTC/USD', 'ETH/USD', 'SOL-PERP', 'BTC-PERP'];

        // Generate 50 mock trades
        for (let i = 0; i < 50; i++) {
            const isWin = Math.random() > 0.45; // 55% Win Rate
            const size = Math.random() * 10 + 1; // 1-11 Size
            const price = 150 + Math.random() * 20; // 150-170 Price
            const fee = size * price * 0.0005; // 0.05% Fee
            const pnl = isWin ? (size * price * (Math.random() * 0.1)) : -(size * price * (Math.random() * 0.08));

            trades.push({
                orderId: `ord_${Math.random().toString(36).substr(2, 9)}`,
                instrId: i % 5,
                symbol: symbols[i % symbols.length],
                side: Math.random() > 0.5 ? 'BUY' : 'SELL',
                price: price,
                size: size,
                timestamp: new Date(baseTime - (i * 3600000 * (Math.random() * 5))), // Spread over time
                fee: fee,
                pnl: pnl
            });
        }
        return trades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    /**
     * Fetch all available trading instruments (markets)
     */
    async getAvailableInstruments(): Promise<InstrumentData[]> {
        if (DERIVERSE_CONFIG.isTesting) {
            return [
                { instrId: 1, symbol: 'SOL/USD', lastPrice: 145.20, bestBid: 145.10, bestAsk: 145.30, volume24h: 1250000, priceChange24h: 2.5 },
                { instrId: 2, symbol: 'BTC/USD', lastPrice: 64200.00, bestBid: 64150, bestAsk: 64250, volume24h: 45000000, priceChange24h: -1.2 },
                { instrId: 3, symbol: 'ETH/USD', lastPrice: 3400.50, bestBid: 3395, bestAsk: 3405, volume24h: 18000000, priceChange24h: 0.8 },
            ];
        }

        if (!this.engine) throw new Error('Engine not initialized');

        const instruments: InstrumentData[] = [];

        for (const [instrId, instr] of this.engine.instruments.entries()) {
            await this.engine.updateInstrData({ instrId });

            const updated = this.engine.instruments.get(instrId);
            if (!updated) continue;

            instruments.push({
                instrId,
                symbol: `${updated.header.assetTokenId}/${updated.header.crncyTokenId}`,
                lastPrice: updated.header.lastPx,
                bestBid: updated.header.bestBid,
                bestAsk: updated.header.bestAsk,
                volume24h: 0,
                priceChange24h: 0,
            });
        }

        return instruments;
    }

    /**
     * Fetch user's current positions
     */
    async getUserPositions(): Promise<UserPosition[]> {
        if (DERIVERSE_CONFIG.isTesting) {
            return [
                { instrId: 1, symbol: 'SOL-PERP', side: 'LONG', size: 10, entryPrice: 142.00, currentPrice: 145.20, pnl: 32.00, pnlPercent: 2.25 },
                { instrId: 2, symbol: 'BTC-PERP', side: 'SHORT', size: 0.5, entryPrice: 65000, currentPrice: 64200, pnl: 400.00, pnlPercent: 1.23 }
            ];
        }

        if (!this.engine) throw new Error('Engine not initialized');

        const positions: UserPosition[] = [];
        const clientData = await this.engine.getClientData();

        for (const [instrId, spotData] of clientData.spot.entries()) {
            const instr = this.engine.instruments.get(instrId);
            if (!instr) continue;

            const ordersInfo = await this.engine.getClientSpotOrdersInfo({
                clientId: spotData.clientId,
                instrId,
            });

            if (ordersInfo.bidsCount > 0 || ordersInfo.asksCount > 0) {
                const orders = await this.engine.getClientSpotOrders({
                    instrId,
                    bidsCount: ordersInfo.bidsCount,
                    bidsEntry: ordersInfo.bidsEntry,
                    asksCount: ordersInfo.asksCount,
                    asksEntry: ordersInfo.asksEntry,
                });

                if (orders.bids && orders.bids.length > 0) {
                    const totalSize = orders.bids.reduce((sum, order) => sum + order.qty, 0);
                    // NOTE: OrderModel doesn't directly expose price. For this analytic estimation without an indexer,
                    // we use the current market price as a proxy for the 'entry' of these active/open orders.
                    // This results in ~0 PnL for spot "positions" derived from open orders, which is acceptable 
                    // for this dashboard's "Live" view limitations.
                    const avgPrice = orders.bids.reduce((sum, order) => sum + instr.header.lastPx * order.qty, 0) / totalSize;

                    positions.push({
                        instrId,
                        symbol: `${instr.header.assetTokenId}/${instr.header.crncyTokenId}`,
                        side: 'LONG',
                        size: totalSize,
                        entryPrice: avgPrice,
                        currentPrice: instr.header.lastPx,
                        pnl: (instr.header.lastPx - avgPrice) * totalSize,
                        pnlPercent: ((instr.header.lastPx - avgPrice) / avgPrice) * 100,
                    });
                }
            }
        }

        return positions;
    }

    /**
     * Fetch user's trade history
     */
    async getTradeHistory(limit: number = 100): Promise<TradeHistory[]> {
        if (DERIVERSE_CONFIG.isTesting) {
            return this.generateMockTradeHistory().slice(0, limit);
        }

        if (!this.engine) throw new Error('Engine not initialized');

        // Fallback to on-chain fetching since SDK doesn't expose history
        return this.fetchOnChainTradeHistory(limit);
    }

    /**
     * Fetch trade history from on-chain transactions
     * This is a "best effort" implementation that looks for interactions with the Deriverse program
     */
    /**
     * Fetch trade history from on-chain transactions
     * This is a "best effort" implementation that looks for interactions with the Deriverse program
     */
    private async fetchOnChainTradeHistory(limit: number): Promise<TradeHistory[]> {
        if (!this.signerAddress || !this.engine) return [];

        try {
            // Use standard Connection from web3.js to avoid Kit type issues
            const connection = new Connection(DERIVERSE_CONFIG.rpcUrl, 'confirmed');
            const pubkey = new PublicKey(this.signerAddress);

            console.log(`[Deriverse] Fetching history for ${pubkey.toBase58()} with Program ID: ${DERIVERSE_CONFIG.programId}`);

            const signatures = await connection.getSignaturesForAddress(pubkey, { limit: limit * 2 });
            console.log(`[Deriverse] Found ${signatures.length} signatures`);

            const relevantSigs = signatures.filter(sig => !sig.err).map(sig => sig.signature);

            if (relevantSigs.length === 0) {
                console.log("[Deriverse] No successful signatures found");
                return [];
            }

            const transactions = await connection.getParsedTransactions(relevantSigs, {
                maxSupportedTransactionVersion: 0,
                commitment: 'confirmed'
            });
            console.log(`[Deriverse] Parsed ${transactions.length} transactions`);

            const history: TradeHistory[] = [];
            const programId = DERIVERSE_CONFIG.programId;

            for (const tx of transactions) {
                if (!tx || !tx.meta || !tx.transaction) continue;

                const accountKeys = tx.transaction.message.accountKeys.map(k => k.pubkey.toBase58());
                const isPlaceholder = programId.includes("Placeholder");
                const hasProgramInteraction = accountKeys.includes(programId);

                if (!isPlaceholder && !hasProgramInteraction) continue;

                const logs = tx.meta.logMessages || [];
                const isTrade = logs.some(log =>
                    log.includes("Instruction: NewSpotOrder") ||
                    log.includes("Instruction: CancelSpotOrder") ||
                    log.includes("Fill") ||
                    log.includes("Trade") ||
                    (isPlaceholder && (log.includes("Deriverse") || log.includes("Order") || log.includes("Instruction")))
                );

                if (isTrade) {
                    history.push({
                        orderId: tx.transaction.signatures[0],
                        instrId: 0,
                        symbol: 'DERIVERSE-ACTION',
                        side: 'BUY',
                        price: 0,
                        size: 0,
                        timestamp: new Date((tx.blockTime || 0) * 1000),
                        fee: (tx.meta.fee || 0) / 1000000000,
                        pnl: 0
                    });
                }
            }

            return history;

        } catch (error) {
            console.error("Failed to fetch on-chain history:", error);
            return [];
        }
    }

    /**
     * Get user's token balances
     */
    async getTokenBalances(): Promise<Map<number, { tokenId: number; amount: number; symbol: string }>> {
        if (DERIVERSE_CONFIG.isTesting) {
            const balances = new Map();
            balances.set(1, { tokenId: 1, amount: 1000, symbol: 'SOL' });
            balances.set(2, { tokenId: 2, amount: 5000, symbol: 'USDC' });
            return balances;
        }

        if (!this.engine) throw new Error('Engine not initialized');

        const clientData = await this.engine.getClientData();
        const balances = new Map();

        for (const [tokenId, balance] of clientData.tokens.entries()) {
            balances.set(tokenId, {
                tokenId,
                amount: balance.amount,
                symbol: `TOKEN_${tokenId}`,
            });
        }

        return balances;
    }

    /**
     * Subscribe to real-time price updates
     */
    async subscribeToInstrument(instrId: number, callback: (data: InstrumentData) => void) {
        if (DERIVERSE_CONFIG.isTesting) {
            // Mock random price updates
            const interval = setInterval(() => {
                const randomChange = (Math.random() - 0.5) * 0.5;
                callback({
                    instrId,
                    symbol: 'MOCK/USD',
                    lastPrice: 100 + (Math.random() * 10),
                    bestBid: 99,
                    bestAsk: 101,
                    volume24h: 1000 + (Math.random() * 100),
                    priceChange24h: randomChange
                });
            }, 3000);
            return () => clearInterval(interval);
        }

        if (!this.engine) throw new Error('Engine not initialized');

        const updateInterval = setInterval(async () => {
            await this.engine!.updateInstrData({ instrId });
            const instr = this.engine!.instruments.get(instrId);

            if (instr) {
                callback({
                    instrId,
                    symbol: `${instr.header.assetTokenId}/${instr.header.crncyTokenId}`,
                    lastPrice: instr.header.lastPx,
                    bestBid: instr.header.bestBid,
                    bestAsk: instr.header.bestAsk,
                    volume24h: 0,
                    priceChange24h: 0,
                });
            }
        }, 5000);

        return () => clearInterval(updateInterval);
    }

    getEngine() {
        return this.engine;
    }
}


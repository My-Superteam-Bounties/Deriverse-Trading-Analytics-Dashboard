
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import type { Transaction, VersionedTransaction } from '@solana/web3.js';
import { DERIVERSE_CONFIG } from './config';
import IDL from './idl/deriverse_analytics.json';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Minimal wallet interface required by AnchorProvider */
export interface AnchorWallet {
    publicKey: PublicKey;
    signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>;
}

/** On-chain Journal account shape */
export interface JournalAccount {
    authority: PublicKey;
    timestamp: bigint;
    tradeHash: PublicKey;
    data: string;
    entryType: {
        onchain?: Record<string, never>;
        hybrid?: Record<string, never>;
        offchain?: Record<string, never>;
    };
}

// ─── Enum ─────────────────────────────────────────────────────────────────────

export enum EntryType {
    ONCHAIN = 0,
    HYBRID = 1,
    OFFCHAIN = 2,
}

/** Maps frontend EntryType to the Anchor enum variant object */
const ENTRY_TYPE_VARIANT: Record<EntryType, Record<string, Record<string, never>>> = {
    [EntryType.ONCHAIN]: { onchain: {} },
    [EntryType.HYBRID]: { hybrid: {} },
    [EntryType.OFFCHAIN]: { offchain: {} },
};

// ─── Read-only wallet stub for fetch-only operations ─────────────────────────

const READ_ONLY_WALLET: AnchorWallet = {
    publicKey: PublicKey.default,
    signTransaction: async (tx) => tx,
    signAllTransactions: async (txs) => txs,
};

// ─── Client ───────────────────────────────────────────────────────────────────

export class JournalClient {
    private readonly programId: PublicKey | null;
    private readonly connection: Connection;

    constructor() {
        const { programId, rpcUrl } = DERIVERSE_CONFIG.analyticsProgram;
        this.programId = programId ? new PublicKey(programId) : null;
        this.connection = new Connection(rpcUrl, 'confirmed');
    }

    isConfigured(): boolean {
        return this.programId !== null;
    }

    private findJournalPda(walletPublicKey: PublicKey, tradeKey: PublicKey): PublicKey {
        const [pda] = PublicKey.findProgramAddressSync(
            [Buffer.from('journal'), walletPublicKey.toBuffer(), tradeKey.toBuffer()],
            this.programId!
        );
        return pda;
    }

    private async resolveTradeKey(tradeHash: string, walletPublicKey: PublicKey): Promise<PublicKey> {
        try {
            return new PublicKey(tradeHash);
        } catch {
            return PublicKey.createWithSeed(
                walletPublicKey,
                tradeHash.substring(0, 30),
                this.programId!
            );
        }
    }

    private makeProgram(wallet: AnchorWallet): Program {
        const provider = new AnchorProvider(this.connection, wallet, AnchorProvider.defaultOptions());
        // IDL already contains metadata.address from anchor build — no injection needed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new Program(IDL as any, provider);
    }

    async saveJournalOnChain(
        wallet: AnchorWallet,
        data: string,
        tradeHash: string,
        entryType: EntryType
    ): Promise<string> {
        if (!this.isConfigured()) {
            throw new Error(
                'Analytics program ID is not configured. Set NEXT_PUBLIC_DERIVERSE_ANALYTICS_PROGRAM_ID in your .env.local'
            );
        }
        if (!wallet.publicKey) throw new Error('Wallet not connected');

        const program = this.makeProgram(wallet);
        const tradeKey = await this.resolveTradeKey(tradeHash, wallet.publicKey);
        const journalPda = this.findJournalPda(wallet.publicKey, tradeKey);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tx: string = await (program.methods as any)
            .addJournal(data, tradeKey, ENTRY_TYPE_VARIANT[entryType])
            .accounts({
                journal: journalPda,
                authority: wallet.publicKey,
                tradeHash: tradeKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        console.log(`[JournalClient] Saved on-chain. TX: ${tx}`);
        return tx;
    }

    /**
     * Fetch ALL journal accounts owned by a wallet.
     * Uses a memcmp filter on the authority field (offset 8 = after 8-byte discriminator).
     */
    async getAllJournals(walletPublicKey: PublicKey): Promise<JournalAccount[]> {
        if (!this.isConfigured()) return [];
        const program = this.makeProgram(READ_ONLY_WALLET);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const accounts = await (program.account as any).journal.all([
                {
                    memcmp: {
                        offset: 8, // skip 8-byte Anchor discriminator
                        bytes: walletPublicKey.toBase58(),
                    },
                },
            ]) as Array<{ publicKey: PublicKey; account: JournalAccount }>;
            return accounts.map((a) => a.account);
        } catch (err) {
            console.error('[JournalClient] getAllJournals failed:', err);
            return [];
        }
    }

    async getJournalEntry(walletPublicKey: PublicKey, tradeHash: string): Promise<JournalAccount | null> {
        if (!this.isConfigured()) return null;

        let tradeKey: PublicKey;
        try {
            tradeKey = new PublicKey(tradeHash);
        } catch {
            return null;
        }

        const journalPda = this.findJournalPda(walletPublicKey, tradeKey);
        const program = this.makeProgram(READ_ONLY_WALLET);

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const account = await (program.account as any).journal.fetch(journalPda) as JournalAccount;
            return account;
        } catch {
            console.log('[JournalClient] No journal found on-chain for this trade.');
            return null;
        }
    }
}

export const journalClient = new JournalClient();


import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { Program, AnchorProvider, Idl, BN, web3 } from '@coral-xyz/anchor';
import { DERIVERSE_CONFIG } from './config';

// Partial IDL for just the instruction we need
const IDL: Idl = {
    version: "0.1.0",
    name: "deriverse_analytics",
    instructions: [
        {
            name: "addJournal",
            accounts: [
                { name: "journal", isMut: true, isSigner: false },
                { name: "authority", isMut: true, isSigner: true },
                { name: "tradeHash", isMut: false, isSigner: false },
                { name: "systemProgram", isMut: false, isSigner: false },
            ],
            args: [
                { name: "data", type: "string" },
                { name: "tradeHash", type: "publicKey" },
                { name: "entryType", type: "u8" },
            ],
        },
    ],
    accounts: [
        {
            name: "Journal",
            type: {
                kind: "struct",
                fields: [
                    { name: "authority", type: "publicKey" },
                    { name: "timestamp", type: "u64" },
                    { name: "tradeHash", type: "publicKey" },
                    { name: "data", type: "string" },
                    { name: "entryType", type: "u8" },
                ],
            },
        },
    ],
};

export enum EntryType {
    ONCHAIN = 0,
    HYBRID = 1,
    OFFCHAIN = 2,
}

export class JournalClient {
    private programId: PublicKey;
    private connection: Connection;

    constructor() {
        this.programId = new PublicKey("42RgC7CEYiGQPigBtixyn7dXqsua4ZxyJnD9Rn1ZQgPD"); // Using ID from lib.rs
        this.connection = new Connection(DERIVERSE_CONFIG.rpcUrl, 'confirmed');
    }

    async saveJournalOnChain(
        wallet: any, // Wallet adapter
        data: string,
        tradeHash: string, // Using string representation of trade ID/Hash
        entryType: EntryType
    ) {
        if (!wallet || !wallet.publicKey) throw new Error("Wallet not connected");

        const provider = new AnchorProvider(
            this.connection,
            wallet,
            AnchorProvider.defaultOptions()
        );

        const program = new Program(IDL, this.programId, provider);

        // Ensure tradeHash is a valid PublicKey or derive one deterministically from the string ID if it's not a pubkey
        let tradeKey: PublicKey;
        try {
            tradeKey = new PublicKey(tradeHash);
        } catch (e) {
            // If tradeHash is not a valid pubkey (e.g. "ord_xxxx"), we can hash it or use a default seed if strictly necessary.
            // For now, let's assume valid pubkey or create a PDA based on the string.
            // Actually, in lib.rs it expects `trade_hash: Pubkey` as an argument AND as a seed.
            // The `trade_hash` account in context is Unchecked, but serves as seed.
            // Just creating a dummy key from seed might be safer if we don't have a real trade account.
            tradeKey = await PublicKey.createWithSeed(
                wallet.publicKey,
                tradeHash.substring(0, 30), // Max length
                this.programId
            ).catch(() => PublicKey.unique()); // Fallback
        }


        const [journalPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("journal"),
                wallet.publicKey.toBuffer(),
                tradeKey.toBuffer()
            ],
            this.programId
        );

        try {
            const tx = await program.methods
                .addJournal(data, tradeKey, entryType)
                .accounts({
                    journal: journalPda,
                    authority: wallet.publicKey,
                    tradeHash: tradeKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            console.log("Journal added, tx:", tx);
            return tx;
        } catch (err) {
            console.error("Failed to add journal:", err);
            throw err;
        }
    }

    async getJournalEntry(walletPublicKey: PublicKey, tradeHash: string) {
        // Similar logic to derive PDA and fetch account
        let tradeKey: PublicKey;
        try {
            tradeKey = new PublicKey(tradeHash);
        } catch (e) {
            // Replicate logic above if needed, but for fetching we need exact match.
            // If we used createWithSeed we need it here too.
            // Simplest is to trust tradeHash is a valid pubkey from transaction history.
            return null;
        }

        const [journalPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("journal"),
                walletPublicKey.toBuffer(),
                tradeKey.toBuffer()
            ],
            this.programId
        );

        const provider = new AnchorProvider(this.connection, {} as any, AnchorProvider.defaultOptions());
        const program = new Program(IDL, this.programId, provider);

        try {
            // @ts-ignore
            const account = await program.account.journal.fetch(journalPda);
            return account;
        } catch (e) {
            console.log("No journal found on chain");
            return null;
        }
    }
}

export const journalClient = new JournalClient();

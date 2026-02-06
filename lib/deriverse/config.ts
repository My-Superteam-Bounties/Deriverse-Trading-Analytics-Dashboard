console.log("Process env")
console.log(process.env.NEXT_PUBLIC_RPC_HTTP)
console.log(process.env.NEXT_PUBLIC_RPC_WS)
console.log(process.env.NEXT_PUBLIC_DERIVERSE_PROGRAM_ID)
console.log(process.env.NEXT_PUBLIC_TOKEN_MINT_A)
console.log(process.env.NEXT_PUBLIC_TOKEN_MINT_B)

export const DERIVERSE_CONFIG = {
    rpcUrl: process.env.NEXT_PUBLIC_RPC_HTTP || 'https://api.devnet.solana.com',
    wsUrl: process.env.NEXT_PUBLIC_RPC_WS || 'wss://api.devnet.solana.com',
    programId: process.env.NEXT_PUBLIC_DERIVERSE_PROGRAM_ID || 'Derive...Placeholder',
    tokens: {
        mintA: process.env.NEXT_PUBLIC_TOKEN_MINT_A || 'So11111111111111111111111111111111111111112',
        mintB: process.env.NEXT_PUBLIC_TOKEN_MINT_B || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    },
    isTesting: process.env.NEXT_PUBLIC_TESTING === 'true',
};

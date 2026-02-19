# Deriverse Trading Analytics Dashboard

A professional-grade trading analytics dashboard for the Solana ecosystem, built for the **Superteam Hackathon**. Deep insights into your trading performance, AI-powered analysis, and seamless journal management — all while keeping your data 100% private.

![Deriverse Dashboard](https://github.com/user-attachments/assets/4a39ff8e-a85e-4ce2-9cc6-5ea83a6c9fa7)

---

## 🚀 Features

### Core Analytics
- **Summary Cards** — Real-time tracking of Total PnL, Volume, Win Rate, and Trade Counts
- **PnL Analysis** — Interactive area charts for historical performance and drawdown visualization
- **Trade History** — Advanced data table with sorting, filtering (date, symbol), and pagination
- **Performance Metrics** — Long/Short ratios, average wins/losses, and duration histograms

### Intelligence Layer (AI Chat)
- **Context-Aware AI** — Ask natural language questions about your portfolio (e.g., *"Analyze my win rate on Tuesdays"*)
- **Rich Media Responses** — Generates dynamic charts, data tables, and structured analyses
- **Smart Input** — Auto-expanding chat interface with file upload capabilities

### Trade Journaling
- **Interactive Journal** — Log trades, add notes, and tag strategies
- **Google Drive Sync** — Permanent, private cloud storage with your own Drive
- **On-Chain Option** — Immutable trade logs via the Solana smart contract

### Live & Demo Modes
- **Live Mode** — Real-time on-chain data from your connected wallet
- **Demo Mode** — Explore all features with sample trading data, no wallet required

---

## 🔒 Privacy-First Architecture

**We do not have a backend database.** Your data never touches our servers.

| Scenario | Where Data Lives |
|---|---|
| No connections | Browser Local Storage (your device only) |
| Wallet connected | Public on-chain trade history fetched read-only |
| Google Drive connected | Journals and chat logs saved as JSON/text files in your Drive |

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/deriverse-analytics.git
cd deriverse-analytics/webapp

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables (`.env.local`)

```env
# Solana RPC (defaults to public Devnet if not set)
NEXT_PUBLIC_RPC_HTTP=https://api.devnet.solana.com

# AI Chat Integration
NEXT_PUBLIC_DEEPSEEK_API_KEY=your_api_key_here

# Google Drive Storage
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_script_api_key
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + CSS Variables |
| State | Zustand (persisted) |
| Charts | Recharts |
| Wallet | Solana Wallet Adapter (Phantom, Solflare) |
| Icons | Lucide React |
| Font | Geist |

---

## 🔗 Deriverse SDK Integration

Integrates with the **Deriverse DEX** via `@deriverse/kit` for real on-chain data.

| Module | Path | Purpose |
|---|---|---|
| Client Wrapper | `lib/deriverse/client.ts` | Browser-friendly SDK methods |
| React Hook | `hooks/useDeriverse.ts` | SDK lifecycle and wallet integration |
| UI Components | `components/deriverse/` | Status displays and trading interfaces |

```typescript
import { useDeriverse } from '@/hooks/useDeriverse';

function TradingComponent() {
  const { client, isInitialized } = useDeriverse();
  if (!isInitialized) return <div>Connecting to Deriverse...</div>;

  const tokenId = await client.getTokenId(mintAddress);
  // ... place orders, deposits, etc.
}
```

---

## ⛓️ Blockchain Backend

Solana smart contract (Anchor) for on-chain analytics and trade journaling.

- **Program**: `deriverse_analytics`
- **Program ID**: `42RgC7CEYiGQPigBtixyn7dXqsua4ZxyJnD9Rn1ZQgPD` (Localnet/Devnet)

```bash
cd backend/deriverse-analytics
anchor build
anchor test
```

---

## 📂 Project Structure

```
├── app/                  # Next.js App Router
│   ├── layout.tsx        # Root layout (Theme, Font)
│   ├── page.tsx          # Main entry (View Switcher)
│   ├── support/          # Support & Changelog pages
│   └── globals.css       # Tailwind 4 & CSS Variables
├── components/
│   ├── dashboard/        # Core analytics widgets (PnL, History, Layout)
│   ├── chat/             # Chat interface (Input, Messages, Bubbles)
│   ├── wallet/           # Wallet connection & profile
│   └── ui/               # Reusable primitives (Buttons, Dialogs, etc.)
├── lib/
│   ├── deriverse/        # SDK client & config
│   ├── app-store.ts      # App state (Demo Mode toggle)
│   ├── chat-store.ts     # AI Chat state
│   └── wallet-store.ts   # Wallet session state
├── hooks/                # Custom hooks (useDeriverse, useDeriverseData)
└── backend/
    ├── programs/         # Solana smart contracts (Rust)
    └── tests/            # TypeScript integration tests
```

---

## 🤝 Support & Updates

Check the [Changelog](/support/changelog) for the latest updates.
For issues, open a ticket on GitHub or reach out on Discord.

---

*Built for the Superteam Hackathon.*

# Deriverse Trading Analytics Dashboard

A professional, high-performance trading analytics dashboard for the Solana ecosystem (and beyond). This application provides real-time insights, PnL analysis, and an AI-powered chat interface for traders.

![Deriverse Dashboard](https://github.com/user-attachments/assets/4a39ff8e-a85e-4ce2-9cc6-5ea83a6c9fa7)

## 🚀 Features

### Core Analytics
- **Summary Cards**: Real-time tracking of Total PnL, Volume, Win Rate, and Trade Counts.
- **PnL Analysis**: Interactive Area Charts for historical performance and drawdown visualization.
- **Trade History**: Advanced data table with sorting, filtering (Date, Symbol), and pagination.
- **Performance Metrics**: Detailed breakdown of Long/Short ratios, Average Wins/Losses, and Duration histograms.

### Intelligence Layer (AI Chat)
- **Context-Aware AI**: Ask natural language questions about your portfolio (e.g., "Analyze my Win Rate").
- **Rich Media Responses**: The AI can generate:
  - **Dynamic Charts**: Visualizing trends instantly.
  - **Data Tables**: Structured data for complex queries.
- **Smart Input**: Auto-expanding chat interface with file upload capabilities.

### Wallet Verification & Security
- **Multi-Chain Support**: Simulated connection for MetaMask (EVM), Phantom (Solana), Rabby, and WalletConnect.
- **Persistent State**: Wallet session management via `zustand` (persisted on refresh).
- **Secure Handling**: Connect/Disconnect flows with truncated address display and balance simulation.

### Professional UI/UX
- **Theme Engine**: "Glassmorphism" aesthetic with deep amber/dark themes using `next-themes`.
- **Responsive Design**: Mobile-first architecture with a dedicated Mobile Navigation bar and Collapsible Sidebar.
- **Notification System**: Real-time alerts accessible via a global header popover.
- **Typography**: Modern and legible using **Geist** font family.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + CSS Variables
- **Language**: TypeScript
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Charts**: [Recharts](https://recharts.org/)
- **Wallet**: Native mock implementation (extensible to RainbowKit/Solana Adapter).
- **Icons**: Lucide React

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/deriverse-analytics.git
   cd deriverse-analytics
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open the dashboard**
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🔗 Deriverse SDK Integration

This dashboard integrates with the **Deriverse DEX** via the `@deriverse/kit` SDK, enabling real on-chain trading operations.

### Architecture

- **Client Wrapper** (`lib/deriverse/client.ts`): Encapsulates the Deriverse `Engine` with browser-friendly methods
- **React Hook** (`hooks/useDeriverse.ts`): Manages SDK lifecycle and wallet integration
- **UI Components** (`components/deriverse/`): Status displays and trading interfaces

### Usage Example

```typescript
import { useDeriverse } from '@/hooks/useDeriverse';

function TradingComponent() {
  const { client, isInitialized } = useDeriverse();
  
  if (!isInitialized) return <div>Connecting to Deriverse...</div>;
  
  // Use client methods for trading operations
  const tokenId = await client.getTokenId(mintAddress);
  // ... place orders, deposits, etc.
}
```

The SDK automatically initializes when a wallet is connected and provides methods for:
- Token and instrument lookups
- Deposit/withdrawal operations  
- Spot order placement and cancellation
- Client data and order book queries

---

## 🔑 Environment Variables

Currently, the application runs in a **Demonstration Mode** using mock data generators (`lib/mock-data.ts`) and does not require external API keys for the core UI.

However, for production integration, rename `.env.example` to `.env.local` and configure:

```env
# Optional: Analytics / RPC Endpoints
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_API_ENDPOINT=https://api.deriverse.io/v1

# AI Integration (Future)
OPENAI_API_KEY=sk-...
```

---

## 📂 Project Structure

```
├── app/                  # Next.js App Router
│   ├── layout.tsx        # Root layout (Theme, Font)
│   ├── page.tsx          # Main entry (View Switcher)
│   └── globals.css       # Tailwind 4 & CSS Variables
├── components/
│   ├── dashboard/        # Core analytics widgets (PnL, History, Layout)
│   ├── chat/             # Chat interface (Input, Messages, Bubbles)
│   ├── wallet/           # Wallet connection logic
│   └── ui/               # Reusable primitives (Buttons, Dialogs, etc.)
├── lib/
│   ├── chat-store.ts     # AI Chat state management
│   ├── wallet-store.ts   # Wallet session state
│   └── mock-data.ts      # Realistic trade generators
└── hooks/                # Custom hooks (e.g., useTradeMetrics)
```

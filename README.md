# Deriverse Trading Analytics Dashboard

Welcome to the **Deriverse Trading Analytics Dashboard**, a professional-grade interface designed for traders on the Deriverse platform. This dashboard provides deep insights into your trading performance, AI-powered analysis, and seamless journal management—all while keeping your data 100% private.

![Dashboard Preview](./webapp/public/deriverse.webp)

## 🌟 Key Features

-   **Privacy-First Architecture**: We do not store your data. Your trading history, journals, and chat logs are stored **locally in your browser** or **in your own Google Drive**. You are in full control.
-   **AI Trading Intelligence**: Chat with an advanced AI assistant that understands your portfolio. Ask questions like *"Why did I lose money on SOL-PERP last week?"* or *"Analyze my win rate on Tuesdays."*
-   **Interactive Trade Journal**: Log your trades, add notes, and tag strategies. Syncs automatically with your Google Drive for permanent, private storage.
-   **Live & Demo Modes**: Toggle between real-time on-chain data and a risk-free Demo Mode to explore the features without connecting a wallet.
-   **Advanced Charting**: Visualize your PnL, volume, and asset distribution with beautiful, interactive charts.

## 🚀 Getting Started

### 1. Connect Your Wallet
Click the "Connect Wallet" button in the top right. We support **Phantom**, **Solflare**, and other major Solana wallets.
*   **Note**: In Demo Mode, you don't need a wallet! Just toggle the "Demo" switch in the header to validan explore.

### 2. Connect Google Drive (Optional but Recommended)
To save your chat history and trade journal permanently, connect your Google Drive in the **Settings** page.
*   **Why?** This allows you to access your data from any device and ensures you never lose your analysis.
*   **Privacy**: We only ask for permission to create and manage files *created by this app*. We cannot see your other personal files.

### 3. Start Analyze
*   **Terminal**: View live market data and your active positions.
*   **Intelligence**: Open the AI drawer to chat about your trades.
*   **Journal**: Log your thoughts on specific trades to improve your psychology.

## 🔒 Privacy & Data Ownership

**Your Data Scenarios:**
1.  **No Connections**: Data is stored in your browser's "Local Storage". It stays on your device but will be lost if you clear your cache.
2.  **Wallet Connected**: We fetch your public on-chain trade history from the Solana blockchain to display analytics. We do not have access to your private keys.
3.  **Google Drive Connected**: Your journals and chat logs are saved as simple, readable JSON and Text files in a specific folder in your Drive. You can delete or export them at any time.

**We do not have a backend database.** We cannot see, sell, or leak your data because we never touch it.

## 🛠️ For Developers

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/deriverse-dashboard.git

# Install dependencies
cd webapp
npm install

# Run development server
npm run dev
```

### Environment Variables (.env.local)

Required for full functionality:

```env
# Solana RPC (Optional, defaults to public Devnet)
NEXT_PUBLIC_RPC_HTTP=https://api.devnet.solana.com

# AI Integration (Required for Chat)
NEXT_PUBLIC_DEEPSEEK_API_KEY=your_api_key_here

# Google Drive (Required for Cloud Storage)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_script_api_key
```

### Architecture
*   **Framework**: Next.js 14 (App Router)
*   **Styling**: Tailwind CSS + Shadcn UI
*   **State Management**: Zustand
*   **Charts**: Recharts
*   **Web3**: Solana Wallet Adapter

## 🤝 Support & Updates

Check out our [Changelog](/support/changelog) for the latest updates.
If you encounter any issues, please open an issue on GitHub or contact the team on Discord.

---
*Built for the Superteam hackathon.* portfolio (e.g., "Analyze my Win Rate").
- **Rich Media Responses**: The AI can generate:
  - **Dynamic Charts**: Visualizing trends instantly.
  - **Data Tables**: Structured data for complex queries.
- **Smart Input**: Auto-expanding chat interface with file upload capabilities.

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

## ⛓️ Blockchain Backend

The project includes a dedicated Solana smart contract (Anchor) for on-chain analytics and trade journaling.

- **Program Name**: `deriverse_analytics`
- **Program ID**: `42RgC7CEYiGQPigBtixyn7dXqsua4ZxyJnD9Rn1ZQgPD` (Localnet/Devnet)
- **Features**:
  - **Trade Journaling**: Securely logs trade execution data and user notes on-chain for immutable history.
  - **Auditable History**: Provides a transparent record of all trading activity.

### Running the Backend

1. **Navigate to the backend directory**
   ```bash
   cd backend/deriverse-analytics
   ```

2. **Build the program**
   ```bash
   anchor build
   ```

3. **Run tests**
   ```bash
   anchor test
   ```

---

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
├── hooks/                # Custom hooks (e.g., useTradeMetrics)
└── backend/              # Anchor workspace
    ├── programs/         # Solana smart contracts (Rust)
    └── tests/            # TypeScript integration tests
```

"use client";

import { TrendingUp, BarChart3, Shield, Zap, Terminal, ArrowRight, Activity, LineChart, ExternalLinkIcon } from "lucide-react";
import Image from "next/image";
import { CustomWalletModal } from "@/components/wallet/CustomWalletModal";
import { BrandCharacter } from "@/components/ui/BrandCharacter";

export function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Noise Texture */}
                <div className="absolute inset-0 z-[1] opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("/noise.svg")' }}></div>

                <div className="absolute top-0 center w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                            <Image
                                src="/deriverse.webp"
                                alt="Deriverse"
                                width={32}
                                height={32}
                                className="object-cover"
                            />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-foreground">Analytics</span>
                    </div>
                    <CustomWalletModal />
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-16">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left Column: Copy */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium tracking-wide uppercase">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Live on Deriverse Devnet
                        </div>

                        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] text-foreground">
                            Data-Driven <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                                Trading Edge
                            </span>
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                            Stop trading blindly. Get deep insights into your Deriverse performance with AI-powered analytics, real-time PnL tracking, and risk metrics.
                        </p>

                        <div className="flex items-center flex-col sm:flex-row gap-4">
                            <CustomWalletModal
                                className="h-12 w-full sm:w-auto px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground border-0 font-bold tracking-wide shadow-lg shadow-primary/20 transition-all hover:scale-105 text-center justify-center"
                            />
                            <a
                                href="https://alpha.deriverse.io"
                                target="_blank"
                                className="h-12 w-full sm:w-auto flex items-center justify-center gap-2 px-6 rounded-xl bg-card border border-border hover:bg-accent hover:text-accent-foreground transition-all font-medium text-foreground/90"
                            >
                                Start Trading Deriverse
                                <ExternalLinkIcon className="w-4 h-4" />
                            </a>
                        </div>

                        <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                <span>No Signup Required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                <span>Real-time Sync</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Terminal Preview */}
                    <div className="relative group pl-24"> {/* Added padding-left to make space for peeping character */}

                        {/* Character Mascot (Peeping from Behind) - Shifted UP to top-0 to clear stats */}
                        <div className="absolute top-0 -left-12 w-48 h-48 z-0 hover:scale-105 transition-transform duration-500 origin-bottom-right">
                            <BrandCharacter pose="peeping" mood="happy" />
                        </div>

                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-3xl opacity-50 group-hover:opacity-75 transition-opacity z-0" />

                        {/* Terminal UI Mock (On Top) */}
                        <div className="relative z-10 bg-card border border-border rounded-xl overflow-hidden shadow-2xl">
                            {/* Terminal Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                                </div>
                                <div className="text-xs font-mono text-muted-foreground">intelligence.js</div>
                            </div>

                            {/* Terminal Content */}
                            <div className="p-6 font-mono text-sm space-y-4">
                                <div className="flex gap-3">
                                    <span className="text-green-500">➜</span>
                                    <span className="text-muted-foreground">analyze --wallet</span>
                                    <span className="text-primary">8x...zk9</span>
                                </div>

                                <div className="space-y-1 pl-6 border-l-2 border-primary/10">
                                    <div className="text-muted-foreground">// Fetching on-chain data...</div>
                                    <div className="flex items-center justify-between py-2">
                                        <span>Total PnL</span>
                                        <span className="text-green-400">+$12,450.32</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <span>Win Rate</span>
                                        <span className="text-primary font-bold">68.5%</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <span>Volume (30d)</span>
                                        <span className="text-blue-400">$1.2M</span>
                                    </div>
                                    <div className="mt-2 text-muted-foreground text-xs">Analysis complete. 3 opportunities found.</div>
                                </div>

                                <div className="flex gap-3 animate-pulse">
                                    <span className="text-green-500">➜</span>
                                    <span className="w-2 h-5 bg-muted-foreground" />
                                </div>
                            </div>
                        </div>

                        {/* Floating Cards */}
                        <div className="absolute -right-4 top-10 bg-card p-4 rounded-lg border border-border shadow-xl hidden lg:block animate-bounce-slow z-10">
                            <Activity className="w-5 h-5 text-primary mb-2" />
                            <div className="text-xs text-muted-foreground">Live Volatility</div>
                            <div className="text-lg font-bold">High</div>
                        </div>

                        <div className="absolute -left-8 bottom-20 bg-card p-4 rounded-lg border border-border shadow-xl hidden lg:block animate-bounce-delayed">
                            <LineChart className="w-5 h-5 text-green-500 mb-2" />
                            <div className="text-xs text-muted-foreground">Weekly Profit</div>
                            <div className="text-lg font-bold">+$2.4k</div>
                        </div>
                    </div>
                </div>

                {/* Bottom Stats / Trust - Keep it minimal */}
                <div className="mt-24 pt-12 border-t border-border/50 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <div className="text-3xl font-bold text-foreground mb-1">100%</div>
                        <div className="text-sm text-muted-foreground uppercase tracking-wider">On-Chain</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-foreground mb-1">0s</div>
                        <div className="text-sm text-muted-foreground uppercase tracking-wider">Latency</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-foreground mb-1">AI</div>
                        <div className="text-sm text-muted-foreground uppercase tracking-wider">Powered</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-foreground mb-1">Solana</div>
                        <div className="text-sm text-muted-foreground uppercase tracking-wider">Network</div>
                    </div>
                </div>
            </main>
        </div>
    );
}


"use client";

import { useEffect, useState } from "react";
import { BrandCharacter, CharacterMood } from "@/components/ui/BrandCharacter";
import { useDeriverse } from "@/hooks/useDeriverse";
import { cn } from "@/lib/utils";
import { X, Sparkles } from "lucide-react";

export function DashboardCompanion() {
    const { client, isInitialized } = useDeriverse();
    const [mood, setMood] = useState<CharacterMood>("neutral");
    const [message, setMessage] = useState<string>("Ready when you are.");
    const [isVisible, setIsVisible] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (!client || !isInitialized) {
            setTimeout(()=> {
                setMood("analyzing");
                setMessage("Connecting to Deriverse network...");
            }, 0)
            return;
        }

        const fetchInsights = async () => {
            try {
                // Fetch user data
                const positions = await client.getUserPositions();

                if (positions.length === 0) {
                    setMood("neutral");
                    setMessage("No active positions. Scanning markets.");
                    return;
                }

                // Calculate total PnL
                const totalPnL = positions.reduce((sum, pos) => sum + (pos.pnl || 0), 0);
                const winCount = positions.filter(p => (p.pnl || 0) > 0).length;
                const winRate = (winCount / positions.length) * 100;

                if (totalPnL > 0) {
                    setMood("happy");
                    setMessage(`Great work! Total PnL is up $${totalPnL.toFixed(2)}.`);
                } else if (totalPnL < -100) {
                    setMood("worried");
                    setMessage("Markets are volatile. Watch your leverage.");
                } else if (totalPnL < 0) {
                    setMood("analyzing");
                    setMessage(`Analyzing ${positions.length} active positions.`);
                } else {
                    setMood("neutral");
                    setMessage("Steady state. Monitoring positions.");
                }

            } catch (err) {
                console.error("Failed to fetch insights", err);
                setMood("worried");
                setMessage("Signal lost. Retrying connection...");
            }
        };

        fetchInsights();
        const interval = setInterval(fetchInsights, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [client, isInitialized]);

    if (!isVisible) return null;

    return (
        <div
            className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Speech Bubble */}
            {message && (
                <div className="mb-4 mr-4 max-w-xs pointer-events-auto animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <div className="relative bg-gradient-to-br from-[#18181B] to-[#09090B] border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
                        <div className="flex items-start gap-3">
                            <div className="p-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-white/90 leading-snug">
                                    {message}
                                </p>
                                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                                    Deriverse Companion
                                </p>
                            </div>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="text-zinc-500 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Speech Bubble Arrow */}
                        <div className="absolute -bottom-2 right-8 w-4 h-4 bg-[#09090B] border-b border-r border-white/10 transform rotate-45" />
                    </div>
                </div>
            )}

            {/* Character */}
            <div className="relative w-32 h-32 pointer-events-auto cursor-pointer hover:scale-110 transition-transform duration-300 group">
                <BrandCharacter mood={mood} />

                {/* Status Indicator Ring */}
                <div className="absolute inset-0 border-2 border-amber-500/0 rounded-full group-hover:border-amber-500/20 group-hover:animate-ping-slow transition-all" />
            </div>
        </div>
    );
}

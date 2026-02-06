"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export type CharacterMood = "neutral" | "happy" | "worried" | "analyzing" | "sleeping";
export type CharacterPose = "default" | "peeping"; // Added Pose

interface BrandCharacterProps {
    className?: string; // Additional classes
    mood?: CharacterMood;
    pose?: CharacterPose;
}

export function BrandCharacter({ className = "", mood = "neutral", pose = "default" }: BrandCharacterProps) {
    // Dynamic styles based on mood
    const { colors, animation, overlay } = useMemo(() => {
        switch (mood) {
            case "happy":
                return {
                    colors: { primary: "#10B981", secondary: "#34D399", glow: "rgba(16, 185, 129, 0.5)" }, // Emerald
                    animation: "animate-bounce",
                    overlay: "sparkles"
                };
            case "worried":
                return {
                    colors: { primary: "#EF4444", secondary: "#F87171", glow: "rgba(239, 68, 68, 0.5)" }, // Red
                    animation: "animate-pulse",
                    overlay: "sweat"
                };
            case "analyzing":
                return {
                    colors: { primary: "#3B82F6", secondary: "#60A5FA", glow: "rgba(59, 130, 246, 0.5)" }, // Blue
                    animation: "animate-float",
                    overlay: "hud"
                };
            case "sleeping":
                return {
                    colors: { primary: "#71717A", secondary: "#A1A1AA", glow: "rgba(113, 113, 122, 0.2)" }, // Zinc
                    animation: "opacity-80 scale-95",
                    overlay: "zzz"
                };
            default: // neutral
                return {
                    colors: { primary: "#F59E0B", secondary: "#F97316", glow: "rgba(245, 158, 11, 0.5)" }, // Amber
                    animation: "animate-float",
                    overlay: "none"
                };
        }
    }, [mood]);

    return (
        <div className={cn("relative pointer-events-none select-none", className)}>
            <svg
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-2xl"
                style={{
                    filter: "drop-shadow(0px 0px 8px " + colors.glow + ")"
                }}
            >
                <defs>
                    <clipPath id="circleMask">
                        <circle cx="100" cy="100" r={pose === 'peeping' ? 95 : 90} />
                    </clipPath>
                    <radialGradient id="bgGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 100) rotate(90) scale(100)">
                        <stop offset="0%" stopColor="#27272a" />
                        <stop offset="100%" stopColor="#09090b" />
                    </radialGradient>

                    {/* Visor Reflection Gradient (kept for aesthetic sheen) */}
                    <linearGradient id="visorReflect" x1="50" y1="80" x2="150" y2="100" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor={colors.primary} stopOpacity="0.2" />
                        <stop offset="50%" stopColor={colors.secondary} stopOpacity="0.05" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>

                {/* Floating Group */}
                <g className={pose === 'peeping' ? '' : animation}>

                    {/* Background Disc - REMOVED per user request */}
                    {/* <circle cx="100" cy="100" r="90" fill="url(#bgGradient)" stroke={colors.primary} strokeWidth="2" strokeOpacity="0.5" /> */}

                    {/* Character Image (Masked) */}
                    {/* Adjust image placement for 'peeping' if needed */}
                    <image
                        href="/deri_chan.png"
                        x={pose === 'peeping' ? "20" : "10"}
                        y="10"
                        width="180"
                        height="180"
                        preserveAspectRatio="xMidYMin slice"
                        clipPath="url(#circleMask)"
                        style={{ transform: pose === 'peeping' ? 'rotate(-10deg) translate(5px, 0)' : '' }}
                    />

                    {/* OVERLAYS based on Mood - RE-ADDED */}

                    {/* Analyzing: HUD Rings */}
                    {overlay === "hud" && (
                        <g className="animate-[spin_10s_linear_infinite] origin-center opacity-60">
                            <circle cx="100" cy="100" r="85" stroke={colors.primary} strokeWidth="1" strokeDasharray="10 5" />
                            <path d="M 100 15 L 100 25" stroke={colors.primary} strokeWidth="2" />
                            <path d="M 100 175 L 100 185" stroke={colors.primary} strokeWidth="2" />
                        </g>
                    )}

                    {/* Happy: Sparkles */}
                    {overlay === "sparkles" && (
                        <g className="animate-pulse">
                            <path d="M 160 50 L 165 40 L 170 50 L 180 55 L 170 60 L 165 70 L 160 60 L 150 55 Z" fill={colors.primary} />
                            <path d="M 40 140 L 45 130 L 50 140 L 60 145 L 50 150 L 45 160 L 40 150 L 30 145 Z" fill={colors.secondary} transform="scale(0.7)" />
                        </g>
                    )}

                    {/* Worried: Sweat Drop */}
                    {overlay === "sweat" && (
                        <g className="animate-bounce" style={{ animationDuration: "2s" }}>
                            <path d="M 150 80 Q 150 70, 155 60 Q 160 70, 160 80 A 5 5 0 1 1 150 80" fill="#3B82F6" opacity="0.8" />
                        </g>
                    )}

                    {/* Sleeping: Zzz */}
                    {overlay === "zzz" && (
                        <g className="animate-pulse" style={{ animationDuration: "3s" }}>
                            <path d="M 150 60 L 170 60 L 150 80 L 170 80" stroke="white" strokeWidth="3" fill="none" opacity="0.8" transform="scale(0.8) translate(10, -10)" />
                            <path d="M 170 40 L 185 40 L 170 55 L 185 55" stroke="white" strokeWidth="2" fill="none" opacity="0.6" />
                        </g>
                    )}
                </g>
            </svg>
        </div>
    );
}

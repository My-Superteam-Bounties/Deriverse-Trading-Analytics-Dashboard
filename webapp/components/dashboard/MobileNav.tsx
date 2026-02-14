"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    LineChart,
    History,
    Menu,
    Sparkles,
    Command
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
    onMenuClick: () => void;
    viewMode?: 'intelligence' | 'terminal';
    setViewMode?: (mode: 'intelligence' | 'terminal') => void;
}

export function MobileNav({ onMenuClick, viewMode, setViewMode }: MobileNavProps) {
    const pathname = usePathname();

    const navItems = [
        { label: "Home", icon: LayoutDashboard, href: "/" },
        { label: "Stats", icon: LineChart, href: "/performance" },
        { label: "History", icon: History, href: "/history" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
            {/* Glassmorphism Container */}
            <div className="mx-4 mb-4 rounded-2xl bg-sidebar/90 backdrop-blur-xl border border-sidebar-border shadow-2xl p-2 flex items-center justify-between">

                {/* Nav Links */}
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-xl transition-all",
                                isActive
                                    ? "text-amber-400 bg-amber-500/10"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="text-[10px] font-medium mt-1">{item.label}</span>
                        </Link>
                    )
                })}

                {/* View Mode Toggle (Exclusive to Home) */}
                {pathname === '/' && setViewMode && (
                    <button
                        onClick={() => setViewMode(viewMode === 'intelligence' ? 'terminal' : 'intelligence')}
                        className="flex flex-col items-center justify-center p-2 rounded-xl text-amber-200 bg-white/5 border border-white/5 active:scale-95 transition-all"
                    >
                        {viewMode === 'intelligence' ? <Command className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                        <span className="text-[10px] font-medium mt-1">{viewMode === 'intelligence' ? 'Terminal' : 'AI'}</span>
                    </button>
                )}

                {/* Menu Toggle */}
                <button
                    onClick={onMenuClick}
                    className="flex flex-col items-center justify-center p-2 rounded-xl text-muted-foreground hover:text-foreground active:scale-95 transition-all"
                >
                    <Menu className="h-5 w-5" />
                    <span className="text-[10px] font-medium mt-1">Menu</span>
                </button>

            </div>
        </div>
    );
}

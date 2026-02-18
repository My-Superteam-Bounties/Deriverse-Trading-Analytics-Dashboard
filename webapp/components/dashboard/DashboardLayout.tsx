"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FloatingSidebar } from "./FloatingSidebar";
import { MobileNav } from "./MobileNav";
import { Bell, Search, Wallet, Command, Sparkles, ArrowRight, CheckCircle, AlertTriangle, Info, HelpCircle } from "lucide-react";
import { CustomWalletModal } from "@/components/wallet/CustomWalletModal";
import { WalletProfilePopover } from "@/components/wallet/WalletProfilePopover";
import { DisclaimerDialog } from "./DisclaimerDialog";
import { DashboardCompanion } from "./DashboardCompanion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DashboardTour } from "./DashboardTour";

interface DashboardLayoutProps {
    children: React.ReactNode;
    viewMode?: 'intelligence' | 'terminal';
    setViewMode?: (mode: 'intelligence' | 'terminal') => void;
}

export function DashboardLayout({ children, viewMode, setViewMode }: DashboardLayoutProps) {
    // Default to collapsed as requested, but try to restore from localStorage
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    const [startTour, setStartTour] = useState(false);

    useEffect(() => {
        const savedState = localStorage.getItem("deriverse_sidebar_collapsed");
        if (savedState !== null) {
            setIsSidebarCollapsed(savedState === "true");
        }
    }, []);

    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        localStorage.setItem("deriverse_sidebar_collapsed", String(newState));
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary relative overflow-hidden">

            {/* Dot Grid Background (Applied globally via globals.css, but enforcing z-index here) */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-dot-grid opacity-30"></div>

            {/* Ambient Flares/Glows - Unified Theme (Visible only in dark mode) */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden dark:block">
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[80%] rounded-full bg-primary/5 blur-[150px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[120px]"></div>
            </div>

            {/* Floating Sidebar (Responsive: Slides in on mobile) */}
            <FloatingSidebar
                isCollapsed={isSidebarCollapsed}
                toggleCollapse={toggleSidebar}
            />

            {/* Mobile Navigation (Desktop: Hidden | Mobile: Visible) */}
            <MobileNav
                onMenuClick={toggleSidebar}
                viewMode={viewMode}
                setViewMode={setViewMode}
            />

            {/* Main Content Area */}
            <div
                className={cn(
                    "relative z-10 min-h-screen transition-all duration-300 ease-in-out flex flex-col",
                    "md:pl-20 px-4 md:pr-8 py-8 pb-24 md:pb-8", // Mobile: px-4 pb-24 (space for bottom nav), Desktop: pl-20
                    !isSidebarCollapsed ? "md:pl-72" : "md:pl-20"
                )}
            >
                <header className="flex items-center justify-between mb-8 h-9">
                    {/* Left: View Switcher */}
                    <div className="flex items-center gap-4">
                        {/* Logo - Visible only when Sidebar is collapsed/hidden */}
                        {isSidebarCollapsed && (
                            <div className="flex items-center gap-3 mr-2 animate-fade-in">
                                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
                                    <Image
                                        src="/deriverse.webp"
                                        alt="Deriverse"
                                        width={32}
                                        height={32}
                                        className="object-cover"
                                    />
                                </div>
                                <span className="text-lg font-bold text-foreground hidden sm:block">
                                    Deriverse
                                </span>
                            </div>
                        )}

                        {setViewMode && (
                            <div id="tour-view-switcher" className="hidden md:flex items-center p-0.5 rounded-lg bg-muted/50 border border-border backdrop-blur-md">
                                <button
                                    onClick={() => setViewMode('intelligence')}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                                        viewMode === 'intelligence'
                                            ? "bg-primary/10 text-primary shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Sparkles className="h-3 w-3" />
                                    <span>Intelligence</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('terminal')}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                                        viewMode === 'terminal'
                                            ? "bg-primary/10 text-primary shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Command className="h-3 w-3" />
                                    <span>Terminal</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setStartTour(true)}
                            className="flex items-center justify-center h-9 w-9 rounded-lg bg-card/80 border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-all shadow-sm backdrop-blur-sm"
                            title="Start Tour"
                        >
                            <HelpCircle className="h-4 w-4" />
                        </button>

                        <Popover>
                            <PopoverTrigger asChild>
                                <button id="tour-notifications" className="flex items-center justify-center h-9 w-9 rounded-lg bg-card/80 border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-all shadow-sm backdrop-blur-sm relative group">
                                    <Bell className="h-4 w-4" />
                                    <span className="absolute top-2 right-2.5 h-1 w-1 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0 rounded-xl border border-border bg-card shadow-xl backdrop-blur-xl mr-4" side="bottom" align="end">
                                <div className="p-4 border-b border-border">
                                    <h4 className="font-semibold text-foreground">Notifications</h4>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {/* Mock Notification Items */}
                                    <div className="p-3 border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer">
                                        <div className="flex items-start gap-3">
                                            <div className="p-1.5 bg-green-500/10 text-green-500 rounded-md mt-0.5">
                                                <CheckCircle className="h-3.5 w-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Trade Executed</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">Long SOL-PERP filled at $145.20</p>
                                                <p className="text-[10px] text-muted-foreground mt-1">2 mins ago</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer">
                                        <div className="flex items-start gap-3">
                                            <div className="p-1.5 bg-red-500/10 text-red-500 rounded-md mt-0.5">
                                                <AlertTriangle className="h-3.5 w-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Margin Warning</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">Margin level approaching 20%</p>
                                                <p className="text-[10px] text-muted-foreground mt-1">1 hour ago</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 border-t border-border">
                                    <Link href="/notifications" className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg transition-colors">
                                        View all notifications
                                        <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Wallet Button */}
                        <div id="tour-wallet-profile">
                            <WalletProfilePopover />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 animate-fade-in-up">
                    {children}
                </main>

                {/* <DisclaimerDialog /> */}
                <DashboardCompanion />
                <DashboardTour
                    currentView={viewMode}
                    onSwitchView={setViewMode}
                    startTour={startTour}
                    onTourStart={() => setStartTour(false)}
                    onTourEnd={() => setStartTour(false)}
                />
            </div>
        </div>
    );
}

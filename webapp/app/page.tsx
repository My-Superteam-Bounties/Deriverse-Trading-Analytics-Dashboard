"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { IntelligenceView } from "@/components/dashboard/IntelligenceView";
import { TerminalView } from "@/components/dashboard/TerminalView";
import { LandingPage } from "@/components/landing/LandingPage";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

export default function Home() {
    const [viewMode, setViewMode] = useState<'intelligence' | 'terminal'>('intelligence');
    const { connected, connecting } = useWallet();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // If wallet connects, stop checking immediately
        if (connected) {
            setIsChecking(false);
            return;
        }

        // If not connected, give it a moment to try auto-connect (prevent flash)
        // If still not connected after timeout, show landing page
        const timer = setTimeout(() => {
            setIsChecking(false);
        }, 1500); // 1.5s grace period for "sleek" loading feel

        return () => clearTimeout(timer);
    }, [connected]);

    // 1. Show Skeleton while checking connection
    if (isChecking && !connected) {
        return <DashboardSkeleton />;
    }

    // 2. Show landing page if check finished and still not connected
    if (!connected) {
        return <LandingPage />;
    }

    // 3. Show dashboard if connected
    return (
        <DashboardLayout viewMode={viewMode} setViewMode={setViewMode}>
            {viewMode === 'intelligence' ? (
                <IntelligenceView onSwitchToTerminal={() => setViewMode('terminal')} />
            ) : (
                <TerminalView />
            )}
        </DashboardLayout>
    );
}

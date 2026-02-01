"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { IntelligenceView } from "@/components/dashboard/IntelligenceView";
import { TerminalView } from "@/components/dashboard/TerminalView";

export default function Home() {
    const [viewMode, setViewMode] = useState<'intelligence' | 'terminal'>('intelligence');

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

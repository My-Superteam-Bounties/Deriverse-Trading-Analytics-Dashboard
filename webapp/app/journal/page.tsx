"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { JournalResearchView } from "@/components/dashboard/JournalResearchView";

export default function JournalPage() {
    return (
        <DashboardLayout>
            <JournalResearchView />
        </DashboardLayout>
    );
}

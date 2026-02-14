"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TradeHistoryTable } from "@/components/dashboard/TradeHistoryTable";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function HistoryPage() {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight text-white">Trade History</h1>
                        <p className="text-slate-400 text-sm">Detailed log of all your trading activities across Spot, Perp, and Option markets.</p>
                    </div>

                    <div className="card-gradient rounded-2xl p-6">
                        <TradeHistoryTable />
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

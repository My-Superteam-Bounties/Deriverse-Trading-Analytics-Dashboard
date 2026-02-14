"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PnLChart } from "@/components/dashboard/PnLChart";
import { PerformanceWidget } from "@/components/dashboard/PerformanceWidget";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function PerformancePage() {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="flex flex-col gap-2 mb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Performance Metrics</h1>
                    <p className="text-slate-400 text-sm">Detailed breakdown of your trading performance.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 min-h-[400px] rounded-2xl bg-[#09090b] border border-white/5 backdrop-blur-sm">
                        <PnLChart />
                    </div>
                    <div className="h-fit rounded-2xl bg-[#09090b] border border-white/5 backdrop-blur-sm p-6">
                        <PerformanceWidget />
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

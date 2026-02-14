"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
    FeeBreakdownChart,
    LongShortPerformanceChart,
    TimeOfDayHeatmap,
    PnLDistributionChart
} from "@/components/dashboard/AnalyticsCharts";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AnalyticsPage() {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight text-white">Advanced Analytics</h1>
                        <p className="text-slate-400 text-sm">Deep dive into your trading performance and behavior.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="card-gradient h-80 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Activity by Hour</h3>
                            <div className="h-[250px] w-full">
                                <TimeOfDayHeatmap />
                            </div>
                        </div>
                        <div className="card-gradient h-80 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">PnL Distribution</h3>
                            <div className="h-[250px] w-full">
                                <PnLDistributionChart />
                            </div>
                        </div>
                        <div className="card-gradient h-80 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Long vs Short PnL</h3>
                            <div className="h-[250px] w-full">
                                <LongShortPerformanceChart />
                            </div>
                        </div>
                        <div className="card-gradient h-80 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Fee Breakdown</h3>
                            <div className="h-[250px] w-full">
                                <FeeBreakdownChart />
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

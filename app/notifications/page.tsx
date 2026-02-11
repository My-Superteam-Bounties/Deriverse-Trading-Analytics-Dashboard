"use client";

import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Bell, CheckCircle, Info, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function NotificationsPage() {
    const notifications = [
        {
            id: 1,
            title: "Trade Executed: SOL-PERP",
            message: "Long position opened at $145.20. Size: 50 SOL.",
            time: "2 mins ago",
            type: "success",
            read: false,
        },
        {
            id: 2,
            title: "Margin Warning",
            message: "Your margin level is approaching 20%. Consider adding collateral.",
            time: "1 hour ago",
            type: "warning",
            read: false,
        },
        {
            id: 3,
            title: "New Feature: AI Insights",
            message: "Check out the new AI-powered trading insights in the Intelligence view.",
            time: "1 day ago",
            type: "info",
            read: true,
        },
        {
            id: 4,
            title: "Deposit Confirmed",
            message: "Deposit of 1000 USDC has been successfully credited to your account.",
            time: "2 days ago",
            type: "success",
            read: true,
        }
    ];

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="max-w-4xl mx-auto space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                            Notifications
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Stay updated with your trading activity and system alerts.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    "flex items-start gap-4 p-4 rounded-xl border transition-all",
                                    notification.read ? "bg-card/50 border-border opacity-70" : "bg-card border-primary/30 shadow-lg shadow-primary/5"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-lg shrink-0",
                                    notification.type === "success" ? "bg-green-500/10 text-green-500" :
                                        notification.type === "warning" ? "bg-red-500/10 text-red-500" :
                                            "bg-blue-500/10 text-blue-500"
                                )}>
                                    {notification.type === "success" && <CheckCircle className="h-5 w-5" />}
                                    {notification.type === "warning" && <AlertTriangle className="h-5 w-5" />}
                                    {notification.type === "info" && <Info className="h-5 w-5" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={cn("font-medium", !notification.read && "text-primary")}>
                                            {notification.title}
                                        </h3>
                                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

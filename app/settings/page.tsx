"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Monitor, Moon, Sun, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

    // Prevent hydration mismatch
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                    <p className="text-muted-foreground text-sm">Manage your preferences and account settings.</p>
                </div>

                <div className="max-w-2xl space-y-6">
                    {/* Appearance */}
                    <section className="card-gradient rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-foreground mb-4">Appearance</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => setTheme('dark')}
                                className={cn(
                                    "flex flex-col items-center gap-3 p-4 rounded-xl border transition-all",
                                    theme === 'dark'
                                        ? "bg-white/5 border-amber-500/50 text-amber-400 shadow-inner"
                                        : "border-border text-muted-foreground hover:bg-muted/50"
                                )}
                            >
                                <Moon className="h-6 w-6" />
                                <span className="text-sm font-medium">Dark</span>
                            </button>
                            <button
                                onClick={() => setTheme('light')}
                                className={cn(
                                    "flex flex-col items-center gap-3 p-4 rounded-xl border transition-all",
                                    theme === 'light'
                                        ? "bg-white/5 border-amber-500/50 text-amber-400 shadow-inner"
                                        : "border-border text-muted-foreground hover:bg-muted/50"
                                )}
                            >
                                <Sun className="h-6 w-6" />
                                <span className="text-sm font-medium">Light</span>
                            </button>
                            <button
                                onClick={() => setTheme('system')}
                                className={cn(
                                    "flex flex-col items-center gap-3 p-4 rounded-xl border transition-all",
                                    theme === 'system'
                                        ? "bg-white/5 border-amber-500/50 text-amber-400 shadow-inner"
                                        : "border-border text-muted-foreground hover:bg-muted/50"
                                )}
                            >
                                <Monitor className="h-6 w-6" />
                                <span className="text-sm font-medium">System</span>
                            </button>
                        </div>
                    </section>

                    {/* Notifications */}
                    <section className="card-gradient rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Bell className="h-5 w-5 text-amber-400" />
                            <h3 className="text-lg font-bold text-foreground">Notifications</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-foreground font-medium">Trade Executions</p>
                                    <p className="text-muted-foreground text-sm">Get notified when orders fill.</p>
                                </div>
                                <div className="h-6 w-11 rounded-full bg-amber-500/20 border border-amber-500/50 relative cursor-pointer">
                                    <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-amber-400 shadow-sm"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-foreground font-medium">Price Alerts</p>
                                    <p className="text-muted-foreground text-sm">Push notifications for price movements.</p>
                                </div>
                                <div className="h-6 w-11 rounded-full bg-white/10 border border-white/10 relative cursor-pointer">
                                    <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-slate-400"></div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}

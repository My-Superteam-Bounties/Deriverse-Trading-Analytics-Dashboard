"use client";

import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, FlaskConical, Shield, Smartphone, Sparkles, Terminal } from "lucide-react";

export default function ChangelogPage() {
    return (
        <DashboardLayout>
            <div className="container mx-auto max-w-4xl p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Changelog</h1>
                    <p className="text-muted-foreground">Latest updates and improvements to the Deriverse Dashboard.</p>
                </div>

                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    {/* Version 1.2.0 */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-primary/50 bg-primary/10 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <Sparkles className="w-5 h-5" />
                        </div>

                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm shadow-sm hover:border-primary/20 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">v0.2.0-beta</Badge>
                                <span className="text-xs text-muted-foreground">Feb 19, 2026</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-3">Intelligence & Accessibility</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex gap-2">
                                    <FlaskConical className="w-4 h-4 text-amber-500 mt-0.5" />
                                    <span>
                                        <strong className="text-foreground">Demo Mode:</strong> New toggle to switch between Live and Mock data. Perfect for exploring the dashboard without connecting a wallet or having active trades.
                                    </span>
                                </li>
                                <li className="flex gap-2">
                                    <Smartphone className="w-4 h-4 text-blue-500 mt-0.5" />
                                    <span>
                                        <strong className="text-foreground">Mobile & Drawer Experience:</strong> Restored the "Drag-to-Close" drawer for chat intelligence. Improved responsive layout on mobile devices.
                                    </span>
                                </li>
                                <li className="flex gap-2">
                                    <Terminal className="w-4 h-4 text-green-500 mt-0.5" />
                                    <span>
                                        <strong className="text-foreground">UI Polish:</strong> Added custom scrollbars globally for a sleek, dark-mode capability. Fixed chat message loading states.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Version 1.1.0 */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <Shield className="w-5 h-5" />
                        </div>

                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm shadow-sm hover:border-primary/20 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="text-muted-foreground">v0.1.5</Badge>
                                <span className="text-xs text-muted-foreground">Feb 15, 2026</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-3">Core Stability & Wallets</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                    <span>
                                        <strong className="text-foreground">Ledger Support:</strong> Fixed connection issues with hardware wallets. Added improved error handling for failed signatures.
                                    </span>
                                </li>
                                <li className="flex gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                    <span>
                                        <strong className="text-foreground">Data Privacy:</strong> Implemented local-first architecture. User data (chat history, settings) stays in your browser or your own Google Drive.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

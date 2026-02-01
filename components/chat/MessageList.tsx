"use client";

import { useChatStore } from "@/lib/chat-store";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { User, Sparkles, Copy, Check } from "lucide-react";
import { useState } from "react";

// Types
import { ChatMessage, ChartData, TableData, MessageType } from "@/lib/chat-store";
import { format } from "date-fns";

export function MessageList() {
    const { messages, isLoading } = useChatStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    return (
        <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto pb-32 pt-20">
            {messages.map((msg) => (
                <MessageItem key={msg.id} message={msg} />
            ))}
            {isLoading && (
                <div className="flex items-start gap-4 animate-pulse">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-2 w-full">
                        <div className="h-4 w-32 bg-muted rounded-md opacity-50"></div>
                        <div className="h-4 w-64 bg-muted rounded-md opacity-30"></div>
                    </div>
                </div>
            )}
            <div ref={scrollRef} />
        </div>
    );
}

function MessageItem({ message }: { message: ChatMessage }) {
    const isUser = message.role === "user";

    return (
        <div className={cn(
            "flex gap-4 w-full animate-fade-in-up",
            isUser ? "justify-end" : "justify-start"
        )}>
            {/* Avatar */}
            {!isUser && (
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 mt-1">
                    <Sparkles className="h-4 w-4 text-white" />
                </div>
            )}

            {/* Content Bubble */}
            <div className={cn(
                "flex flex-col gap-2 max-w-[85%] md:max-w-[75%]",
                isUser ? "items-end" : "items-start"
            )}>
                <div className={cn(
                    "rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed",
                    isUser
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-card border border-border text-foreground rounded-bl-none shadow-md"
                )}>
                    {message.type === "text" && (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{message.content || ""}</ReactMarkdown>
                        </div>
                    )}

                    {message.type === "chart" && message.chartData && (
                        <div className="w-full min-w-[300px] md:min-w-[450px]">
                            <h4 className="font-semibold mb-4 text-muted-foreground text-xs uppercase tracking-wider">
                                {message.chartData.title}
                            </h4>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={message.chartData.data}>
                                        <defs>
                                            <linearGradient id={`gradient-${message.id}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={message.chartData.config.color || "#06b6d4"} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={message.chartData.config.color || "#06b6d4"} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="var(--muted-foreground)"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="var(--muted-foreground)"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `$${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "var(--card)",
                                                borderColor: "var(--border)",
                                                borderRadius: "8px",
                                                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                                            }}
                                            itemStyle={{ color: "var(--foreground)" }}
                                            labelStyle={{ color: "var(--muted-foreground)" }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={message.chartData.config.color || "#06b6d4"}
                                            fill={`url(#gradient-${message.id})`}
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {message.type === "table" && message.tableData && (
                        <div className="w-full overflow-hidden rounded-lg border border-border">
                            <div className="bg-muted/50 px-4 py-2 border-b border-border flex justify-between items-center">
                                <span className="text-xs font-medium text-muted-foreground uppercase">{message.tableData.title}</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-muted/20 text-muted-foreground uppercase font-semibold">
                                        <tr>
                                            {message.tableData.columns.map((col, i) => (
                                                <th key={i} className="px-4 py-2 whitespace-nowrap">{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {message.tableData.rows.map((row, i) => (
                                            <tr key={i} className="hover:bg-muted/10 transition-colors">
                                                {message.tableData!.columns.map((col, j) => (
                                                    <td key={j} className="px-4 py-2 whitespace-nowrap text-foreground font-medium">
                                                        {row[col]}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-muted-foreground px-1 opacity-50">
                    {format(message.timestamp, "HH:mm")}
                </span>
            </div>

            {/* User Avatar */}
            {isUser && (
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-1 border border-border">
                    <User className="h-4 w-4 text-muted-foreground" />
                </div>
            )}
        </div>
    );
}

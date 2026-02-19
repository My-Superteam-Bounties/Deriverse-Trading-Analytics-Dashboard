"use client";

import { useEffect, useState } from "react";
import { useChatStore } from "@/lib/chat-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, MessageSquare, Loader2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface DriveFile {
    id: string;
    name: string;
    modifiedTime: string;
}

export function ChatHistorySidebar({ className }: { className?: string }) {
    const { loadSession, currentSessionId } = useChatStore();
    const [chats, setChats] = useState<DriveFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const fetchChats = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/drive', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'listChats' })
            });
            const data = await res.json();
            if (data.chats) {
                setChats(data.chats);
            }
        } catch (error) {
            console.error("Failed to fetch chats", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadChat = async (fileId: string) => {
        await loadSession(fileId);
    };

    return (
        <div className={cn("flex flex-col h-full bg-card/30", className)}>
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <History className="h-4 w-4" /> History
                </h3>
            </div>

            <ScrollArea className="flex-1 p-2">
                {isLoading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-1">
                        {chats.map((chat) => (
                            <Button
                                key={chat.id}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLoadChat(chat.id)}
                                className={cn(
                                    "w-full justify-start text-left h-auto py-3 px-3 relative truncate",
                                    currentSessionId === chat.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <MessageSquare className="h-3 w-3 mr-2 shrink-0" />
                                <div className="flex flex-col gap-0.5 overflow-hidden">
                                    <span className="truncate text-xs font-medium">
                                        {chat.name.replace('Chat_', '').replace('.json', '')}
                                    </span>
                                    <span className="text-[10px] opacity-70 flex items-center gap-1">
                                        <Calendar className="h-2 w-2" />
                                        {new Date(chat.modifiedTime).toLocaleDateString()}
                                    </span>
                                </div>
                            </Button>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}

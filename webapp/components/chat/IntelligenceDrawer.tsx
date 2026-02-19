"use client";

import { useChatStore } from "@/lib/chat-store";
import { Drawer, DrawerContent, DrawerOverlay } from "@/components/ui/drawer";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { Button } from "@/components/ui/button";
import { X, Save, Sparkles, TerminalSquare, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ChatHistorySidebar } from "@/components/chat/ChatHistorySidebar";
import { SaveSessionDialog } from "@/components/chat/SaveSessionDialog";

export function IntelligenceDrawer() {
    const { isDrawerOpen, closeDrawer, saveChatToDrive, messages, resetChat, syncWithUrl } = useChatStore();
    const hasMessages = messages.length > 0;
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Sync URL on mount/update
    useEffect(() => {
        syncWithUrl();
    }, [isDrawerOpen]);

    const handleNewSession = () => {
        if (hasMessages) {
            setShowSaveDialog(true);
        } else {
            resetChat();
        }
    };

    const handleSaveAndNew = async () => {
        const success = await saveChatToDrive();
        if (success) {
            resetChat();
            setShowSaveDialog(false);
        }
    };

    const handleDiscardAndNew = () => {
        resetChat();
        setShowSaveDialog(false);
    };

    return (
        <Drawer open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()} shouldScaleBackground>
            <DrawerContent className="!h-[96vh] !max-h-[96vh] flex flex-col border-t border-border/50 shadow-2xl outline-none z-[999]">

                {/* 1. Drag Handle Area */}
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted my-3 opacity-50 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" />

                {/* 2. Main Layout Container */}
                <div className="flex flex-1 overflow-hidden relative w-full max-w-7xl mx-auto px-2 md:px-6 pb-2">

                    {/* Sidebar (Desktop) */}
                    <div className={cn(
                        "transition-all duration-300 ease-in-out relative overflow-hidden border-r border-border/40 hidden md:block",
                        isSidebarOpen ? "w-64 mr-4" : "w-0 mr-0"
                    )}>
                        <div className="absolute inset-0 w-64 h-full">
                            <ChatHistorySidebar className="w-full h-full rounded-lg bg-card/40 border border-border/40" />
                        </div>
                    </div>

                    {/* Main Chat Column */}
                    <div className="flex-1 flex flex-col overflow-hidden relative bg-card/20 rounded-xl border border-border/40 shadow-sm">

                        {/* Header */}
                        <header className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-background/50 backdrop-blur-sm z-10 shrink-0">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground hidden md:flex"
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                >
                                    <History className="h-4 w-4" />
                                </Button>

                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                                        <Sparkles className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h2 className="text-sm font-semibold tracking-tight">Intelligence</h2>
                                        {hasMessages && (
                                            <span className="text-[10px] text-muted-foreground font-mono leading-none">
                                                ID: {messages[0]?.id?.slice(0, 8)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleNewSession}
                                    className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <TerminalSquare className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">New Chat</span>
                                </Button>

                                {hasMessages && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => saveChatToDrive()}
                                        className="h-8 gap-2 text-xs text-muted-foreground hover:text-primary"
                                    >
                                        <Save className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Save</span>
                                    </Button>
                                )}

                                <div className="w-px h-4 bg-border/40 mx-2" />

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => closeDrawer()}
                                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </header>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden relative flex flex-col">
                            <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
                                <div className="max-w-3xl mx-auto pb-4">
                                    <MessageList />
                                </div>
                            </div>

                            {/* Input */}
                            <div className="p-4 bg-background border-t border-border/40 shrink-0">
                                <div className="max-w-3xl mx-auto space-y-2">
                                    <ChatInput isFloating={false} />
                                    <div className="flex justify-center">
                                        <span className="text-[10px] text-muted-foreground/50 font-mono">
                                            Logs saved to Drive/Deriverse_Journals/Chats
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <SaveSessionDialog
                    open={showSaveDialog}
                    onOpenChange={setShowSaveDialog}
                    onSave={handleSaveAndNew}
                    onDiscard={handleDiscardAndNew}
                />
            </DrawerContent>
        </Drawer>
    );
}

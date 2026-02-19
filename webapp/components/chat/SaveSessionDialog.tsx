"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SaveSessionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: () => void;
    onDiscard: () => void;
}

export function SaveSessionDialog({ open, onOpenChange, onSave, onDiscard }: SaveSessionDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="z-[1000]">
                <AlertDialogHeader>
                    <AlertDialogTitle>Save current session?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You are about to start a new chat. Do you want to save the current session to your Google Drive first?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDiscard} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Discard
                    </AlertDialogAction>
                    <AlertDialogAction onClick={onSave}>
                        Save & New Chat
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

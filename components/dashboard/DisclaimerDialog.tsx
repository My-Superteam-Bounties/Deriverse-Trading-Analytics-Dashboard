"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function DisclaimerDialog() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const hasAcknowledged = localStorage.getItem("deriverse-disclaimer-acknowledged");
        if (!hasAcknowledged) {
            setOpen(true);
        }
    }, []);

    const handleAcknowledge = () => {
        localStorage.setItem("deriverse-disclaimer-acknowledged", "true");
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px] border-amber-500/20 bg-background/95 backdrop-blur-xl shadow-2xl">
                <DialogHeader className="flex flex-col items-center gap-4 py-4">
                    <div className="p-3 rounded-full bg-amber-500/10 text-amber-500 animate-pulse">
                        <AlertTriangle className="h-8 w-8" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-center">
                        Development Preview
                    </DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground text-sm leading-relaxed">
                        Welcome to the Deriverse Trading Analytics Dashboard.
                        <br /><br />
                        Please note that this is a <span className="text-foreground font-semibold">demonstration environment</span>. All data shown (trades, PnL, balances) is mock data generated for testing purposes. No real transactions are processed.
                        <br /><br />
                        <span className="text-amber-500 font-medium">✨ The full product will be going live very soon! Stay tuned.</span>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center pt-2">
                    <Button
                        onClick={handleAcknowledge}
                        className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold"
                    >
                        I Understand
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

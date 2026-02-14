"use client";

import { useState, useEffect } from "react";
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
import { AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertType = 'error' | 'warning' | 'info' | 'success';

export interface CriticalAlert {
    id: string;
    type: AlertType;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface CriticalAlertDialogProps {
    alert: CriticalAlert | null;
    onClose: () => void;
}

const ALERT_ICONS = {
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle2,
};

const ALERT_COLORS = {
    error: "text-red-500",
    warning: "text-amber-500",
    info: "text-blue-500",
    success: "text-emerald-500",
};

export function CriticalAlertDialog({ alert, onClose }: CriticalAlertDialogProps) {
    if (!alert) return null;

    const Icon = ALERT_ICONS[alert.type];
    const iconColor = ALERT_COLORS[alert.type];

    const handleConfirm = () => {
        alert.onConfirm?.();
        onClose();
    };

    const handleCancel = () => {
        alert.onCancel?.();
        onClose();
    };

    return (
        <AlertDialog open={!!alert} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={cn("h-10 w-10 rounded-full bg-muted flex items-center justify-center", iconColor)}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <AlertDialogTitle className="text-xl">{alert.title}</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-base leading-relaxed">
                        {alert.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    {alert.cancelText && (
                        <AlertDialogCancel onClick={handleCancel}>
                            {alert.cancelText}
                        </AlertDialogCancel>
                    )}
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className={cn(
                            alert.type === 'error' && "bg-red-500 hover:bg-red-600",
                            alert.type === 'warning' && "bg-amber-500 hover:bg-amber-600"
                        )}
                    >
                        {alert.confirmText || "OK"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

/**
 * Hook to manage critical alerts
 * Usage:
 * ```tsx
 * const { showAlert, AlertComponent } = useCriticalAlert();
 * 
 * // Show alert
 * showAlert({
 *   type: 'error',
 *   title: 'Connection Failed',
 *   description: 'Unable to connect to the trading server.',
 *   confirmText: 'Retry',
 *   onConfirm: () => retryConnection(),
 * });
 * 
 * // Render in component
 * return <>{AlertComponent}</>
 * ```
 */
export function useCriticalAlert() {
    const [alert, setAlert] = useState<CriticalAlert | null>(null);

    const showAlert = (alertConfig: Omit<CriticalAlert, 'id'>) => {
        setAlert({
            ...alertConfig,
            id: Math.random().toString(36),
        });
    };

    const closeAlert = () => {
        setAlert(null);
    };

    const AlertComponent = <CriticalAlertDialog alert={alert} onClose={closeAlert} />;

    return { showAlert, closeAlert, AlertComponent };
}

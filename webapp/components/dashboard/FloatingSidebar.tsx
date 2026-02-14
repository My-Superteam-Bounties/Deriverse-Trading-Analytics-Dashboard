"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  History,
  Settings,
  PieChart,
  Grid,
  ChevronLeft,
  AlertCircle,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWalletStore } from "@/lib/wallet-store";

interface FloatingSidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export function FloatingSidebar({ isCollapsed, toggleCollapse }: FloatingSidebarProps) {
  const pathname = usePathname();
  const { isConnected } = useWalletStore();

  const navItems = [
    { label: "Overview", icon: LayoutDashboard, href: "/" },
    { label: "Performance", icon: LineChart, href: "/performance" },
    { label: "Trade History", icon: History, href: "/history" },
    { label: "Analytics", icon: PieChart, href: "/analytics" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <>
      {/* Detached Toggle Button (Always Visible if Sidebar is Closed) */}
      <button
        onClick={toggleCollapse}
        className={cn(
          "fixed left-4 top-8 z-[60] h-9 w-9 rounded-lg bg-sidebar border border-sidebar-border hidden md:flex items-center justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground transition-all shadow-xl hover:scale-105 active:scale-95 group",
          !isCollapsed && "opacity-0 pointer-events-none" // Hide this button when sidebar is open (sidebar has its own close button)
        )}
        title="Open Sidebar"
      >
        <Grid className="h-5 w-5 group-hover:text-primary transition-colors" />
      </button>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed z-50 flex flex-col transition-all duration-300 ease-in-out bg-sidebar/95 backdrop-blur-xl shadow-2xl overflow-hidden",
          // Mobile: Full screen, fixed inset 0
          "md:left-4 md:top-4 md:bottom-4 md:rounded-3xl md:w-64 md:border md:border-sidebar-border md:bg-sidebar/95 inset-0 w-full rounded-none border-none",
          // Collapse state
          isCollapsed ? "-translate-x-full md:-translate-x-[110%] opacity-0 pointer-events-none" : "translate-x-0 opacity-100 pointer-events-auto",
          // Additional border/separation styles
          "border-r border-sidebar-border md:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)]"
        )}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-sidebar-border/50 relative shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
              <Image
                src="/deriverse.webp"
                alt="Deriverse Logo"
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <span className="text-lg font-bold text-foreground animate-fade-in">
              Deriverse
            </span>
          </div>

          {/* Close Button inside Sidebar */}
          <button
            onClick={toggleCollapse}
            className="h-8 w-8 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 border border-sidebar-border flex items-center justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Wallet Connection Status */}
        {!isConnected && (
          <div className="mx-3 mt-4 p-3 bg-primary/10 border border-primary/20 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-primary">Wallet Required</p>
                <p className="text-xs text-primary/70 mt-0.5">Connect your wallet to access trading data</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isDisabled = !isConnected;

            return (
              <Link
                key={item.href}
                href={isDisabled ? "#" : item.href}
                onClick={(e) => isDisabled && e.preventDefault()}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                  isDisabled && "opacity-40 cursor-not-allowed",
                  !isDisabled && isActive
                    ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                    : !isDisabled && "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {isActive && !isDisabled && <div className="absolute inset-0 bg-primary/5 z-0"></div>}
                <item.icon className={cn("h-5 w-5 transition-colors shrink-0 z-10", isActive && !isDisabled ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />

                <span className={cn("ml-3 truncate animate-fade-in z-10", isActive && !isDisabled && "font-bold")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Support Shortcut */}
        <div className="p-4 border-t border-sidebar-border/50 shrink-0">
          <Link href="/support" className="flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors group">
            <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shrink-0">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div className="flex-1 overflow-hidden animate-fade-in text-left">
              <p className="text-sm font-medium text-sidebar-foreground group-hover:text-primary transition-colors truncate">Support</p>
              <p className="text-xs text-muted-foreground truncate">Get Help & Docs</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

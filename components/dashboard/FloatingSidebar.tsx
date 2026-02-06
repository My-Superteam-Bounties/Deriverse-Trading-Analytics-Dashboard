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
  Wallet,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWalletStore } from "@/lib/wallet-store";

interface FloatingSidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export function FloatingSidebar({ isCollapsed, toggleCollapse }: FloatingSidebarProps) {
  const pathname = usePathname();
  const { isConnected, address, walletType } = useWalletStore();

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
        <Grid className="h-5 w-5 group-hover:text-amber-400 transition-colors" />
      </button>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed z-50 flex flex-col transition-all duration-300 ease-in-out bg-sidebar/95 backdrop-blur-xl shadow-2xl overflow-hidden",
          // Mobile: Full screen, fixed inset 0
          "md:left-4 md:top-4 md:bottom-4 md:rounded-3xl md:w-64 md:border md:border-sidebar-border inset-0 w-full rounded-none border-none",
          // Collapse state
          isCollapsed ? "-translate-x-full md:-translate-x-[110%] opacity-0 pointer-events-none" : "translate-x-0 opacity-100 pointer-events-auto"
        )}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 relative shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 overflow-hidden">
              <Image
                src="/deriverse.webp"
                alt="Deriverse Logo"
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-sidebar-foreground to-sidebar-foreground/60 bg-clip-text text-transparent animate-fade-in">
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
          <div className="mx-3 mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-amber-500">Wallet Required</p>
                <p className="text-xs text-amber-500/70 mt-0.5">Connect your wallet to access trading data</p>
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
                    ? "bg-gradient-to-r from-amber-500/20 to-purple-500/10 text-amber-400 shadow-inner border border-white/5"
                    : !isDisabled && "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && !isDisabled && <div className="absolute inset-0 bg-amber-400/5 z-0"></div>}
                <item.icon className={cn("h-5 w-5 transition-colors shrink-0 z-10", isActive && !isDisabled ? "text-amber-400" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground")} />

                <span className={cn("ml-3 truncate animate-fade-in z-10", isActive && !isDisabled && "font-bold")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Wallet Info */}
        <div className="p-4 border-t border-white/5 shrink-0">
          {isConnected ? (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg relative">
                <Wallet className="h-4 w-4" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-[#09090b]"></span>
              </div>
              <div className="flex-1 overflow-hidden animate-fade-in">
                <p className="text-xs font-medium text-sidebar-foreground/60 truncate">{walletType || "Wallet"}</p>
                <p className="text-xs text-sidebar-foreground truncate font-mono">{address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "Connected"}</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-muted-foreground">
              Connect wallet to continue
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

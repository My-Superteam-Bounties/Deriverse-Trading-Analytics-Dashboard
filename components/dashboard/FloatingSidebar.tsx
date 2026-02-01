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
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingSidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export function FloatingSidebar({ isCollapsed, toggleCollapse }: FloatingSidebarProps) {
  const pathname = usePathname();

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

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-amber-500/20 to-purple-500/10 text-amber-400 shadow-inner border border-white/5"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && <div className="absolute inset-0 bg-amber-400/5 z-0"></div>}
                <item.icon className={cn("h-5 w-5 transition-colors shrink-0 z-10", isActive ? "text-amber-400" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground")} />

                <span className={cn("ml-3 truncate animate-fade-in z-10", isActive && "font-bold")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Profile */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer hover:bg-white/5">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg relative">
              JD
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-[#09090b]"></span>
            </div>
            <div className="flex-1 overflow-hidden animate-fade-in">
              <p className="text-sm font-medium text-sidebar-foreground truncate">James Doe</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">Pro Plan</p>
            </div>
            <LogOut className="h-4 w-4 text-sidebar-foreground/60 hover:text-destructive transition-colors" />
          </div>
        </div>
      </aside>
    </>
  );
}

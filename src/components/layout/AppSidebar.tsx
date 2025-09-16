import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Brain,
  Database,
  TrendingUp,
  Users,
  Target,
  Bell,
  Layout,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Overview",
    href: "/",
    icon: BarChart3,
  },
  {
    name: "Quick Insights",
    href: "/quick-insights",
    icon: Zap,
  },
];

const coreServices = [
  {
    name: "DataConnect Pro",
    href: "/dataconnect",
    icon: Database,
  },
  {
    name: "ML Studio",
    href: "/insight-ai",
    icon: Brain,
  },
  {
    name: "ForecastPro",
    href: "/forecast-pro",
    icon: TrendingUp,
  },
  {
    name: "SegmentAI",
    href: "/segment-ai",
    icon: Users,
  },
  {
    name: "RecommendPro",
    href: "/recommend-pro",
    icon: Target,
  },
  {
    name: "AlertIQ",
    href: "/alert-iq",
    icon: Bell,
  },
  {
    name: "DashboardStudio",
    href: "/dashboard-studio",
    icon: Layout,
  },
];

const management = [
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function AppSidebar({ collapsed, onToggleCollapsed }: AppSidebarProps) {
  const location = useLocation();

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = location.pathname === item.href;
    
    return (
      <NavLink
        to={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
          "hover:bg-accent hover:text-accent-foreground",
          isActive
            ? "nav-item-active text-primary-foreground"
            : "text-muted-foreground"
        )}
      >
        <item.icon className="h-4 w-4 flex-shrink-0" />
        {!collapsed && <span>{item.name}</span>}
      </NavLink>
    );
  };

  const SectionHeader = ({ title }: { title: string }) => {
    if (collapsed) return null;
    
    return (
      <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {title}
      </h3>
    );
  };

  return (
    <div
      className={cn(
        "relative h-screen bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggleCollapsed}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border shadow-sm hover:bg-accent transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-6">
        {collapsed ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            S
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              S
            </div>
            <span className="text-lg font-bold">StartupAI</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 p-4">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>

        {/* Core Services */}
        <div className="space-y-1">
          <SectionHeader title="Core Services" />
          {coreServices.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>

        {/* Management */}
        <div className="space-y-1">
          <SectionHeader title="Management" />
          {management.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>
      </nav>
    </div>
  );
}
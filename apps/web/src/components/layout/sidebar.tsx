"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Users,
  ImageIcon,
  FileText,
  Settings,
  Scissors,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Appointments", icon: ClipboardList },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden h-screen flex-col bg-night text-ivory/80 transition-all duration-200 md:flex",
        collapsed ? "w-[68px]" : "w-60"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-ivory/6 px-4",
          collapsed ? "justify-center" : "gap-2.5"
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brass/12">
          <Scissors className="h-4 w-4 text-brass" />
        </div>
        {!collapsed && (
          <span className="font-heading text-sm font-bold tracking-tight text-ivory">
            360 Yabu
          </span>
        )}
      </div>

      {/* Nav Links */}
      <ScrollArea className="flex-1 py-3">
        <nav className="flex flex-col gap-0.5 px-2">
          {sidebarLinks.map((link) => {
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            const Icon = link.icon;

            const linkClasses = cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
              isActive
                ? "bg-brass/12 text-brass"
                : "text-ivory/45 hover:bg-ivory/5 hover:text-ivory/80",
              collapsed && "justify-center px-2"
            );

            if (collapsed) {
              return (
                <Tooltip key={link.href}>
                  <TooltipTrigger
                    render={<Link href={link.href} className={linkClasses} />}
                  >
                    <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-brass")} />
                  </TooltipTrigger>
                  <TooltipContent side="right">{link.label}</TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link key={link.href} href={link.href} className={linkClasses}>
                <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-brass")} />
                <span>{link.label}</span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-brass" />
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Collapse Toggle */}
      <div className="border-t border-ivory/6 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-ivory/25 hover:text-ivory/60 hover:bg-ivory/5"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info, Image, Search, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/about", icon: Info, label: "About" },
  null, // placeholder for center FAB
  { href: "/gallery", icon: Image, label: "Gallery" },
  { href: "/book/status", icon: Search, label: "Status" },
] as const;

export function PublicMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-5 left-1/2 z-50 flex w-[90%] max-w-sm -translate-x-1/2 items-center justify-around rounded-2xl border border-border/30 bg-night/95 px-2 py-2 text-ivory shadow-2xl backdrop-blur-xl md:hidden">
      {tabs.map((tab, idx) => {
        if (!tab) {
          // Center FAB — Book button
          return (
            <div key="book-fab" className="relative -top-5">
              <Link
                href="/book"
                className={cn(
                  "flex h-13 w-13 items-center justify-center rounded-full border-[3px] border-night shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
                  pathname === "/book"
                    ? "bg-brass text-night brass-glow-strong"
                    : "bg-brass text-night hover:bg-brass-light"
                )}
                title="Book Appointment"
              >
                <Scissors className="h-5 w-5 rotate-90" />
              </Link>
              <span className="absolute -bottom-4 left-1/2 w-max -translate-x-1/2 text-[9px] font-bold uppercase tracking-widest text-brass">
                Book
              </span>
            </div>
          );
        }

        const Icon = tab.icon;
        const isActive =
          tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors duration-200",
              isActive ? "text-brass" : "text-ivory/50 hover:text-ivory/80"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{tab.label}</span>
            {isActive && (
              <span className="mt-0.5 h-1 w-1 rounded-full bg-brass" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

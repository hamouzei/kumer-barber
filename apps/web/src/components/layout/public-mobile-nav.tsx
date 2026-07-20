"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info, Image, Search, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

export function PublicMobileNav() {
  const pathname = usePathname();

  const isHomeActive = pathname === "/";
  const isAboutActive = pathname === "/about";
  const isGalleryActive = pathname === "/gallery";
  const isStatusActive = pathname.startsWith("/book/status");
  const isBookActive = pathname === "/book";

  return (
    <nav className="fixed bottom-6 left-1/2 z-50 flex w-[92%] max-w-md -translate-x-1/2 items-center justify-between rounded-full border border-brass/30 bg-brand/95 px-6 py-2.5 text-linen shadow-2xl backdrop-blur-md md:hidden">
      {/* Home */}
      <Link
        href="/"
        className={cn(
          "flex flex-col items-center gap-1 text-[10px] font-medium transition-colors duration-200",
          isHomeActive ? "text-brass" : "text-linen/60 hover:text-linen"
        )}
      >
        <Home className="h-5 w-5" />
        <span>Home</span>
      </Link>

      {/* About */}
      <Link
        href="/about"
        className={cn(
          "flex flex-col items-center gap-1 text-[10px] font-medium transition-colors duration-200",
          isAboutActive ? "text-brass" : "text-linen/60 hover:text-linen"
        )}
      >
        <Info className="h-5 w-5" />
        <span>About</span>
      </Link>

      {/* Primary Floating action button (The Rudder) */}
      <div className="relative -top-5">
        <Link
          href="/book"
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#0F141C] shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
            isBookActive
              ? "bg-brass text-brand"
              : "bg-brass text-brand hover:bg-brass-light"
          )}
          title="Book Appointment"
        >
          <Scissors className="h-6 w-6 rotate-90" />
        </Link>
        {/* Floating action label */}
        <span className="absolute -bottom-5 left-1/2 w-max -translate-x-1/2 text-[9px] font-bold uppercase tracking-wider text-brass">
          Book
        </span>
      </div>

      {/* Gallery */}
      <Link
        href="/gallery"
        className={cn(
          "flex flex-col items-center gap-1 text-[10px] font-medium transition-colors duration-200",
          isGalleryActive ? "text-brass" : "text-linen/60 hover:text-linen"
        )}
      >
        <Image className="h-5 w-5" />
        <span>Gallery</span>
      </Link>

      {/* Check Status */}
      <Link
        href="/book/status"
        className={cn(
          "flex flex-col items-center gap-1 text-[10px] font-medium transition-colors duration-200",
          isStatusActive ? "text-brass" : "text-linen/60 hover:text-linen"
        )}
      >
        <Search className="h-5 w-5" />
        <span>Status</span>
      </Link>
    </nav>
  );
}

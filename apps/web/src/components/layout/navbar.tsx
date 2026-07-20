"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/team", label: "Meet the Barber" },
  { href: "/book/status", label: "Check Booking" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight"
        >
          <Scissors className="h-5 w-5 text-brass" />
          <span>360 Yabu</span>
        </Link>

        {/* Desktop Nav (hidden on mobile) */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-brass ${
                pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/book" className="ml-3">
            <Button
              size="sm"
              className="bg-brass text-brand hover:bg-brass-light font-semibold"
            >
              Book Now
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}

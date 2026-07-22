"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Scissors, Camera, MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api-client";
import type { BusinessSettings } from "@/types";

interface FooterProps {
  contactPhone?: string | null;
  contactEmail?: string | null;
  address?: string | null;
  socialLinks?: Record<string, string>;
}

export function Footer({
  contactPhone: propPhone,
  contactEmail: propEmail,
  address: propAddress,
  socialLinks: propSocials,
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    // If props are missing, fetch settings automatically
    if (!propPhone && !propEmail && !propAddress && !propSocials) {
      api
        .get<BusinessSettings>("/settings")
        .then(setSettings)
        .catch(() => {});
    }
  }, [propPhone, propEmail, propAddress, propSocials]);

  const phone = propPhone ?? settings?.contactPhone;
  const email = propEmail ?? settings?.contactEmail;
  const address = propAddress ?? settings?.address;
  const socials = propSocials ?? settings?.socialLinks;

  const hasSocials =
    socials &&
    Object.values(socials).some((v) => v && v.trim().length > 0);
  const hasContact = phone || email || address;

  return (
    <footer className="border-t border-border bg-brand text-linen/80">
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-28 md:pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-heading text-lg font-bold text-linen"
            >
              <Scissors className="h-5 w-5 text-brass" />
              360 Yabu
            </Link>
            <p className="text-sm leading-relaxed text-linen/60">
              Premium grooming experience. Professional haircuts with
              precision and care.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-linen/40">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-2">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About" },
                { href: "/gallery", label: "Gallery" },
                { href: "/team", label: "Meet the Barber" },
                { href: "/book", label: "Book an Appointment" },
                { href: "/book/status", label: "Check Booking Status" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-linen/60 transition-colors hover:text-brass"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact & Socials */}
          {hasContact && (
            <div className="space-y-4">
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-linen/40">
                Contact
              </h3>
              <div className="flex flex-col gap-3">
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center gap-2 text-sm text-linen/60 transition-colors hover:text-brass"
                  >
                    <Phone className="h-4 w-4 shrink-0" />
                    {phone}
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2 text-sm text-linen/60 transition-colors hover:text-brass"
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    {email}
                  </a>
                )}
                {address && (
                  <p className="flex items-start gap-2 text-sm text-linen/60">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    {address}
                  </p>
                )}
              </div>

              {hasSocials && (
                <div className="flex gap-3 pt-2">
                  {socials?.instagram && (
                    <a
                      href={socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-linen/40 transition-colors hover:text-brass"
                      aria-label="Instagram"
                    >
                      <Camera className="h-5 w-5" />
                    </a>
                  )}
                  {socials?.telegram && (
                    <a
                      href={socials.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-linen/40 transition-colors hover:text-brass"
                      aria-label="Telegram"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <Separator className="my-8 bg-linen/10" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-linen/40">
            © {currentYear} 360 Yabu. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

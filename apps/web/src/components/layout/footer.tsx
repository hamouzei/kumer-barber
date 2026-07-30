"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Scissors, Camera, MessageCircle, Phone, Mail, MapPin } from "lucide-react";
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
    <footer className="border-t border-white/5 bg-night text-ivory/70">
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-28 md:pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-heading text-lg font-bold text-ivory"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass/15">
                <Scissors className="h-4 w-4 text-brass" />
              </div>
              360 Yabu
            </Link>
            <p className="text-sm leading-relaxed text-ivory/40 max-w-xs">
              Premium grooming experience in Addis Ababa. Precision cuts,
              master-level craftsmanship, and a space designed for you.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ivory/30">
              Navigate
            </h3>
            <nav className="flex flex-col gap-2.5">
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
                  className="text-sm text-ivory/50 transition-colors hover:text-brass"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact & Socials */}
          {hasContact && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ivory/30">
                Contact
              </h3>
              <div className="flex flex-col gap-3">
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center gap-2.5 text-sm text-ivory/50 transition-colors hover:text-brass"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-brass/60" />
                    {phone}
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2.5 text-sm text-ivory/50 transition-colors hover:text-brass"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-brass/60" />
                    {email}
                  </a>
                )}
                {address && (
                  <p className="flex items-start gap-2.5 text-sm text-ivory/50">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-brass/60" />
                    {address}
                  </p>
                )}
              </div>

              {hasSocials && (
                <div className="flex gap-3 pt-3">
                  {socials?.instagram && (
                    <a
                      href={socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-ivory/5 text-ivory/40 transition-all hover:bg-brass/15 hover:text-brass"
                      aria-label="Instagram"
                    >
                      <Camera className="h-4 w-4" />
                    </a>
                  )}
                  {socials?.telegram && (
                    <a
                      href={socials.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-ivory/5 text-ivory/40 transition-all hover:bg-brass/15 hover:text-brass"
                      aria-label="Telegram"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-12 border-t border-ivory/5 pt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-ivory/25">
            © {currentYear} 360 Yabu. All rights reserved.
          </p>
          <p className="text-xs text-ivory/25">
            Addis Ababa, Ethiopia
          </p>
        </div>
      </div>
    </footer>
  );
}

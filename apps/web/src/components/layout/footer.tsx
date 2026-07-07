import Link from "next/link";
import { Scissors, Camera, MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface FooterProps {
  contactPhone?: string | null;
  contactEmail?: string | null;
  address?: string | null;
  socialLinks?: Record<string, string>;
}

export function Footer({
  contactPhone,
  contactEmail,
  address,
  socialLinks,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  const hasSocials =
    socialLinks &&
    Object.values(socialLinks).some((v) => v && v.trim().length > 0);
  const hasContact = contactPhone || contactEmail || address;

  return (
    <footer className="border-t border-border bg-brand text-linen/80">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
                {contactPhone && (
                  <a
                    href={`tel:${contactPhone}`}
                    className="flex items-center gap-2 text-sm text-linen/60 transition-colors hover:text-brass"
                  >
                    <Phone className="h-4 w-4 shrink-0" />
                    {contactPhone}
                  </a>
                )}
                {contactEmail && (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="flex items-center gap-2 text-sm text-linen/60 transition-colors hover:text-brass"
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    {contactEmail}
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
                  {socialLinks?.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-linen/40 transition-colors hover:text-brass"
                      aria-label="Instagram"
                    >
                      <Camera className="h-5 w-5" />
                    </a>
                  )}
                  {socialLinks?.telegram && (
                    <a
                      href={socialLinks.telegram}
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

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Scissors,
  Clock,
  Shield,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api-client";
import type { BusinessSettings, GalleryImage } from "@/types";
import { BarbershopMap } from "@/components/shared/barbershop-map";

interface ContentSectionData {
  title?: string;
  body?: string;
  [key: string]: unknown;
}

/** Inline TikTok icon — avoids an external icon dependency */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.8.1V9.01a6.27 6.27 0 0 0-.8-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.48a8.27 8.27 0 0 0 4.85 1.56V7.6a4.83 4.83 0 0 1-1.09-.91z" />
    </svg>
  );
}

const SERVICE_HIGHLIGHTS = [
  {
    icon: Scissors,
    title: "Master-Level Precision",
    description:
      "Fades, lineups, classic cuts — every stroke deliberate, every edge clean. We study your features and cut to complement them.",
  },
  {
    icon: Clock,
    title: "Book in Under a Minute",
    description:
      "Pick your date, choose a time, confirm. No calls, no waiting. Your slot is secured the moment you hit submit.",
  },
  {
    icon: Shield,
    title: "The Full Experience",
    description:
      "Hot towels, premium oils, razor-clean edges. Every visit is designed to be the best part of your week.",
  },
];

export default function HomePage() {
  const [heroContent, setHeroContent] = useState<ContentSectionData | null>(
    null
  );
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    Promise.all([
      api
        .get<Record<string, ContentSectionData>>("/content")
        .catch(() => null),
      api.get<BusinessSettings>("/settings").catch(() => null),
      api.get<GalleryImage[]>("/gallery").catch(() => []),
    ]).then(([contentRes, settingsRes, images]) => {
      if (contentRes?.hero) setHeroContent(contentRes.hero);
      if (settingsRes) setSettings(settingsRes);
      if (images) setGalleryImages(images.slice(0, 6));
    });
  }, []);

  const headline = heroContent?.title || "Look Sharp.\nEvery Single Time.";
  const description =
    heroContent?.body ||
    "Precision haircuts, hot towel shaves, and top-tier grooming tailored to your style. Walk out looking your absolute best.";

  return (
    <div className="page-transition">
      {/* ═══════ HERO — VIDEO BACKGROUND ═══════ */}
      <section className="relative min-h-[70vh] sm:min-h-[85vh] flex items-center justify-center overflow-hidden bg-night">
        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/kumer-hero.jpg"
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover object-center"
        >
          <source src="/images/hero_section.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-night/60 via-night/50 to-night/80" />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="mb-6 flex justify-center anim-fade-up">
            <div className="inline-flex items-center justify-center h-16 w-16 sm:h-[72px] sm:w-[72px] rounded-full bg-night drop-shadow-lg shrink-0">
              <Image
                src="/kumer_the_barber_logo.svg"
                alt="Kumer Barbershop Logo"
                width={72}
                height={72}
                className="h-12 w-12 sm:h-14 sm:w-14 object-contain"
                priority
              />
            </div>
          </div>

          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brass/25 bg-brass/10 px-4 py-1.5 backdrop-blur-sm anim-fade-up">
            <Scissors className="h-3.5 w-3.5 text-brass" />
            <span className="text-[11px] font-semibold tracking-[0.15em] text-brass uppercase">
              Kumer Barbershop
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-4xl font-bold tracking-tight text-ivory sm:text-5xl lg:text-6xl lg:leading-[1.1] whitespace-pre-line anim-fade-up anim-delay-1">
            {headline}
          </h1>

          {/* Description */}
          <p className="mx-auto mt-5 max-w-xl text-base text-ivory/55 leading-relaxed font-sans whitespace-pre-line anim-fade-up anim-delay-2">
            {description}
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 anim-fade-up anim-delay-3">
            <Link href="/book" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-brass text-night hover:bg-brass-light font-semibold text-sm px-7 h-12 gap-2 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Book Appointment
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a
              href="https://www.tiktok.com/@kumer_the_barber?_r=1&_t=ZS-98ux2hHpzOh"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-ivory/20 text-ivory hover:bg-ivory/10 hover:border-ivory/30 dark:border-ivory/20 dark:text-ivory dark:hover:bg-ivory/10 dark:hover:border-ivory/30 border-foreground/30 text-foreground hover:bg-foreground/5 text-sm px-7 h-12 gap-2 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <TikTokIcon className="h-4 w-4" />
                View Our Work
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ═══════ SERVICE HIGHLIGHTS ═══════ */}
      <section className="py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass mb-3">
              Why Choose Us
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Craftsmanship You Can Feel
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {SERVICE_HIGHLIGHTS.map((item, idx) => (
              <div
                key={item.title}
                className={`group relative rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:brass-glow hover:border-brass/20 anim-fade-up anim-delay-${idx + 1}`}
              >
                {/* Brass left accent */}
                <div className="absolute left-0 top-6 bottom-6 w-0.5 rounded-full bg-brass/30 group-hover:bg-brass transition-colors duration-300" />

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brass/8 mb-5">
                  <item.icon className="h-5 w-5 text-brass" />
                </div>
                <h3 className="font-heading text-lg font-bold mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ GALLERY PREVIEW ═══════ */}
      {galleryImages.length > 0 && (
        <section className="py-20 bg-night">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass mb-3">
                  Our Work
                </p>
                <h2 className="font-heading text-3xl font-bold tracking-tight text-ivory sm:text-4xl">
                  Recent Cuts
                </h2>
              </div>
              <Link
                href="/gallery"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-brass hover:text-brass-light transition-colors"
              >
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
              {galleryImages.map((image, idx) => (
                <Link
                  key={image.imageId}
                  href="/gallery"
                  className={`group relative aspect-square overflow-hidden rounded-xl bg-ash anim-fade-up anim-delay-${Math.min(idx + 1, 5)}`}
                >
                  <Image
                    src={image.imageUrl}
                    alt={image.title ?? "Gallery image"}
                    fill
                    className="object-cover transition-all duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-night/0 group-hover:bg-night/30 transition-all duration-300" />
                  {image.title && (
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-sm font-medium text-ivory">
                        {image.title}
                      </p>
                    </div>
                  )}
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/gallery"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brass hover:text-brass-light transition-colors"
              >
                View all work
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════ LOCATION ═══════ */}
      <section className="py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BarbershopMap
            address={settings?.address}
            googleMapsUrl={settings?.googleMapsUrl}
            contactPhone={settings?.contactPhone}
            openingTime={settings?.openingTime}
            closingTime={settings?.closingTime}
          />
        </div>
      </section>

      {/* ═══════ CTA STRIP ═══════ */}
      <section className="bg-night py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center gap-6">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-ivory sm:text-5xl max-w-xl anim-fade-up">
              Ready for a Fresh Look?
            </h2>
            <p className="max-w-md text-ivory/40 text-sm sm:text-base leading-relaxed anim-fade-up anim-delay-1">
              Reserve your session and get the sharp look you deserve. Book
              online in seconds.
            </p>
            <Link href="/book" className="mt-2 anim-fade-up anim-delay-2">
              <Button
                size="lg"
                className="bg-brass text-night hover:bg-brass-light font-semibold text-sm px-10 h-13 gap-2"
              >
                Book Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

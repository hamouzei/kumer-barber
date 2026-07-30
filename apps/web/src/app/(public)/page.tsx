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
  const shopAddress = settings?.address || "Addis Ababa, Ethiopia";

  return (
    <div className="page-transition">
      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden bg-night">
        {/* Subtle radial gradient */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(200,150,90,0.08),transparent)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left — Text */}
            <div className="flex flex-col items-start lg:col-span-6 space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-brass/20 bg-brass/8 px-4 py-1.5">
                <Scissors className="h-3.5 w-3.5 text-brass" />
                <span className="text-[11px] font-semibold tracking-[0.15em] text-brass uppercase">
                  360 Yabu Barber Studio
                </span>
              </div>

              <h1 className="font-heading text-4xl font-bold tracking-tight text-ivory sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1] whitespace-pre-line anim-fade-up">
                {headline}
              </h1>

              <p className="max-w-lg text-base text-ivory/50 leading-relaxed font-sans whitespace-pre-line anim-fade-up anim-delay-1">
                {description}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-1 anim-fade-up anim-delay-2">
                <Link href="/book" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-brass text-night hover:bg-brass-light font-semibold text-sm px-7 h-12 gap-2"
                  >
                    Book Appointment
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/gallery" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-ivory/15 text-ivory hover:bg-ivory/5 text-sm px-7 h-12"
                  >
                    View Our Work
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — Hero Image */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end anim-fade-up anim-delay-2">
              <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden">
                {/* Brass frame accent */}
                <div className="absolute -inset-px rounded-2xl border border-brass/15 z-10 pointer-events-none" />
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <Image
                    src="/images/barber-hero.png"
                    alt="360 Yabu Barber Studio"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-night/10 to-transparent" />
                </div>

                {/* Overlay badge */}
                <div className="absolute bottom-5 left-5 right-5 z-10 flex items-center gap-3 rounded-xl border border-ivory/10 bg-night/80 px-4 py-3 backdrop-blur-md">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brass/15">
                    <Scissors className="h-4 w-4 text-brass" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ivory">
                      360 Yabu Barber
                    </p>
                    <p className="text-[11px] text-ivory/45">{shopAddress}</p>
                  </div>
                </div>
              </div>
            </div>
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

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Scissors, Clock, Shield, Award } from "lucide-react";
import { api } from "@/lib/api-client";
import type { BusinessSettings } from "@/types";
import { BarbershopMap } from "@/components/shared/barbershop-map";

interface ContentSectionData {
  title?: string;
  body?: string;
  [key: string]: unknown;
}

export default function HomePage() {
  const [heroContent, setHeroContent] = useState<ContentSectionData | null>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<Record<string, ContentSectionData>>("/content").catch(() => null),
      api.get<BusinessSettings>("/settings").catch(() => null),
    ]).then(([contentRes, settingsRes]) => {
      if (contentRes?.hero) setHeroContent(contentRes.hero);
      if (settingsRes) setSettings(settingsRes);
    });
  }, []);

  const headline = heroContent?.title || "Look Sharp. Every Single Time.";
  const description =
    heroContent?.body ||
    "Experience precision haircuts, hot towel shaves, and top-tier grooming tailored to your style. Book your session online and walk out looking your absolute best.";
  const shopAddress = settings?.address || "Bole, Addis Ababa";

  return (
    <div className="page-transition">
      {/* Hero Section - Matching the clean style of About, Team, and Gallery sections */}
      <section className="bg-brand py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Hero Left Content */}
            <div className="flex flex-col items-start text-left lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-brass/20 bg-brass/10 px-4 py-1.5">
                <Scissors className="h-3.5 w-3.5 text-brass" />
                <span className="text-xs font-semibold tracking-wider text-brass uppercase">
                  Premium Barbering Experience
                </span>
              </div>

              <h1 className="font-heading text-4xl font-bold tracking-tight text-linen sm:text-5xl lg:text-6xl leading-tight">
                {headline}
              </h1>

              <p className="max-w-xl text-lg text-linen/70 leading-relaxed font-sans whitespace-pre-line">
                {description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
                <Link href="/book" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-brass text-brand hover:bg-brass-light font-semibold text-base px-8 h-12"
                  >
                    Book Appointment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/gallery" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-linen/20 text-linen hover:bg-linen/10 text-base px-8 h-12"
                  >
                    View Our Work
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Right Image Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl border border-brass/20 bg-brand p-3 shadow-xl overflow-hidden">
                <div className="relative h-full w-full rounded-xl overflow-hidden bg-black">
                  <Image
                    src="/images/barber-hero.png"
                    alt="360 Yabu Barber Studio"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand/80 via-transparent to-transparent" />
                </div>

                <div className="absolute bottom-6 left-6 right-6 z-10 flex items-center justify-between rounded-lg border border-linen/15 bg-brand/90 px-4 py-3 shadow-md backdrop-blur-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-brass/20">
                      <Award className="h-4 w-4 text-brass" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-linen">360 Yabu Barber Studio</p>
                      <p className="text-[10px] text-linen/60">{shopAddress}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="border-b border-border bg-linen py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Scissors,
                title: "Expert Craftsmanship",
                description:
                  "Years of refining the blade craft, offering master-level precision cuts matched uniquely to your style.",
              },
              {
                icon: Clock,
                title: "Easy Online Booking",
                description:
                  "Select your date, choose your time slot, and confirm your session in seconds with zero friction.",
              },
              {
                icon: Shield,
                title: "Premium Grooming Experience",
                description:
                  "Top-shelf oils, razor-clean blades, and relaxing hot towels. Every detail curated for your comfort.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center p-6 rounded-xl border border-border bg-background shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brass/10 border border-brass/20 mb-4">
                  <item.icon className="h-5 w-5 text-brass" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Barbershop Map & Directions Section */}
      <section className="py-16">
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

      {/* CTA Strip Section */}
      <section className="bg-brand py-20 text-center border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-linen sm:text-4xl">
            Ready for a Fresh Look?
          </h2>
          <p className="max-w-md text-linen/60 text-sm sm:text-base leading-relaxed">
            Reserve your session at {shopAddress}&apos;s premier grooming studio and get the sharp look you deserve today.
          </p>
          <Link href="/book" className="mt-2">
            <Button
              size="lg"
              className="bg-brass text-brand hover:bg-brass-light font-semibold text-base px-10 h-12"
            >
              Book Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

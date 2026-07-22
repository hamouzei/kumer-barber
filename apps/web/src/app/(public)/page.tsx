"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Scissors, Clock, Shield, Award } from "lucide-react";
import { api } from "@/lib/api-client";
import type { BusinessSettings } from "@/types";

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
  const shopAddress = settings?.address || "Addis Ababa";

  return (
    <div className="page-transition min-h-screen bg-brand">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center bg-[#07090D] bg-[radial-gradient(ellipse_at_center,rgba(196,151,90,0.08)_0%,rgba(13,13,13,1)_70%)] py-20 lg:py-32">
        {/* Fine grain overlay */}
        <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')]" />
        
        {/* Ambient lighting shapes */}
        <div className="absolute top-1/4 left-1/10 h-72 w-72 rounded-full bg-brass/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/10 h-96 w-96 rounded-full bg-brass/5 blur-[150px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left Content Column */}
            <div className="flex flex-col items-start text-left lg:col-span-7 space-y-6 animate-in fade-in slide-in-from-left-6 duration-700">
              
              {/* Floating tag badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-brass/20 bg-brass/5 px-4 py-1.5 shadow-[0_0_15px_rgba(196,151,90,0.05)]">
                <Scissors className="h-3.5 w-3.5 text-brass animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest text-brass uppercase">
                  Premium Barbering Craft
                </span>
              </div>

              {/* Dynamic Title with Gold/Brass metallic gradient */}
              <h1 className="font-heading text-4xl font-extrabold tracking-tight text-linen sm:text-6xl lg:text-7xl leading-[1.1] max-w-2xl">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brass-light via-brass to-brass-dark">
                  {headline}
                </span>
              </h1>

              {/* Dynamic description */}
              <p className="max-w-xl text-base sm:text-lg text-linen/70 leading-relaxed font-sans whitespace-pre-line">
                {description}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
                <Link href="/book" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-brass text-brand hover:bg-brass-light hover:shadow-[0_0_20px_rgba(196,151,90,0.3)] font-semibold text-base px-8 h-12 transition-all duration-300 active:scale-95"
                  >
                    Book Appointment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/gallery" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-linen/20 text-linen hover:bg-linen/10 text-base px-8 h-12 transition-colors duration-300"
                  >
                    View Our Work
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Showcase Image Column */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-6 duration-700 delay-100">
              <div className="relative w-full max-w-md aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-2xl border border-brass/15 bg-brand/40 p-3.5 shadow-2xl backdrop-blur-sm overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-brass/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />
                <div className="absolute inset-0 border border-transparent group-hover:border-brass/30 transition-colors duration-500 rounded-2xl pointer-events-none z-20" />

                <div className="relative h-full w-full rounded-xl overflow-hidden bg-zinc-900">
                  <Image
                    src="/images/barber-hero.png"
                    alt="Premium Barber Chair and Shop Interior"
                    fill
                    sizes="(max-w-7xl) 50vw, 100vw"
                    priority
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand/60 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Card footer details tag */}
                <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between rounded-lg border border-brass/25 bg-brand/90 px-4 py-3 shadow-lg backdrop-blur-md">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-brass/10">
                      <Award className="h-4 w-4 text-brass" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-linen tracking-wide">360 Yabu Studio</p>
                      <p className="text-[10px] text-brass font-medium">{shopAddress}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-brass/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brass">
                    Elite
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom edge accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brass/35 to-transparent" />
      </section>

      {/* Value Props Section */}
      <section className="border-b border-border bg-[#0B0E14] relative">
        <div className="mx-auto grid max-w-7xl gap-0 sm:grid-cols-3">
          {[
            {
              icon: Scissors,
              title: "Expert Craftsmanship",
              description:
                "Years of refining the blade craft, offering master-level precision cuts matched uniquely to your facial structure.",
            },
            {
              icon: Clock,
              title: "Easy Online Booking",
              description:
                "Select a date, pick your slot, upload deposit proof, and lock in your session in seconds. Zero friction.",
            },
            {
              icon: Shield,
              title: "Premium Grooming Experience",
              description:
                "Top-shelf oils, clean blades, and relaxing hot towels. Every detail curated for your comfort and style.",
            },
          ].map((item, index) => (
            <div
              key={item.title}
              className={`flex flex-col items-center gap-3 px-8 py-16 text-center group transition-colors duration-300 hover:bg-brass/[0.01] ${
                index < 2 ? "border-b sm:border-b-0 sm:border-r border-border/60" : ""
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brass/5 border border-brass/15 transition-all duration-300 group-hover:bg-brass/10 group-hover:scale-105">
                <item.icon className="h-5 w-5 text-brass" />
              </div>
              <h3 className="font-heading text-lg font-bold text-linen mt-2">
                {item.title}
              </h3>
              <p className="text-sm text-linen/50 leading-relaxed max-w-xs">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Strip Section */}
      <section className="relative overflow-hidden bg-brand py-20 text-center">
        <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-brass/5 blur-[100px] pointer-events-none" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-linen sm:text-4xl">
            Ready for a Fresh Look?
          </h2>
          <p className="max-w-md text-linen/60 text-sm sm:text-base leading-relaxed">
            Reserve your session with {shopAddress}&apos;s premier grooming studio and get the sharp look you deserve today.
          </p>
          <Link href="/book" className="mt-4">
            <Button
              size="lg"
              className="bg-brass text-brand hover:bg-brass-light hover:shadow-[0_0_20px_rgba(196,151,90,0.25)] font-semibold text-base px-10 h-12 transition-all duration-300 active:scale-95"
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

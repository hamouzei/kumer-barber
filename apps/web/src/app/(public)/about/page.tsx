"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Scissors, Award, Heart, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import type { BusinessSettings } from "@/types";

interface ContentSectionData {
  title?: string;
  body?: string;
  imageUrl?: string;
  [key: string]: unknown;
}

const VALUES = [
  {
    icon: Scissors,
    title: "Precision",
    description:
      "Every cut is executed with meticulous attention to detail, ensuring clean lines and perfect symmetry.",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "We continuously refine our craft, staying current with the latest techniques and trends in men's grooming.",
  },
  {
    icon: Heart,
    title: "Care",
    description:
      "Your comfort and satisfaction are our top priority. We listen, advise, and deliver results you'll love.",
  },
];

export default function AboutPage() {
  const [aboutContent, setAboutContent] = useState<ContentSectionData | null>(
    null
  );
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api
        .get<Record<string, ContentSectionData>>("/content")
        .catch(() => null),
      api.get<BusinessSettings>("/settings").catch(() => null),
    ])
      .then(([contentRes, settingsRes]) => {
        if (contentRes?.about) setAboutContent(contentRes.about);
        if (settingsRes) setSettings(settingsRes);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const title = aboutContent?.title || "About Us";
  const bodyText =
    aboutContent?.body ||
    `At Kemkem, we believe that a great haircut is more than just a trim — it's an experience. Founded with a passion for precision and a commitment to quality, we deliver premium grooming services that leave our clients feeling confident and refreshed.

Our approach combines time-honored barbering techniques with modern styling trends. Whether you're looking for a classic cut, a sharp fade, or a complete style transformation, we bring dedication and attention to detail to every client.`;
  const imageUrl = (aboutContent?.imageUrl as string) || "";

  return (
    <div className="page-transition">
      {/* Header */}
      <section className="bg-night py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass mb-3 anim-fade-up">
              Our Story
            </p>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-ivory sm:text-5xl anim-fade-up anim-delay-1">
              {title}
            </h1>
            <p className="mt-4 text-base text-ivory/45 leading-relaxed anim-fade-up anim-delay-2">
              Where precision meets passion. Every cut tells a story.
            </p>
          </div>
        </div>
      </section>

      {/* Story & Image */}
      <section className="py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brass" />
            </div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              {/* Image */}
              {imageUrl && (
                <div className="relative anim-fade-up">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border shadow-lg">
                    <Image
                      src={imageUrl}
                      alt={title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  {/* Decorative accent */}
                  <div className="absolute -bottom-3 -right-3 h-24 w-24 rounded-2xl border border-brass/20 -z-10" />
                </div>
              )}

              {/* Text */}
              <div
                className={`space-y-5 anim-fade-up anim-delay-1 ${!imageUrl ? "lg:col-span-2 max-w-3xl" : ""}`}
              >
                <div className="h-1 w-12 rounded-full bg-brass" />
                <div className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                  {bodyText}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-night">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass mb-3">
              Our Values
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-ivory sm:text-4xl">
              What We Stand For
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {VALUES.map((value, idx) => (
              <div
                key={value.title}
                className={`group rounded-2xl border border-ivory/8 bg-ash p-7 transition-all duration-300 hover:border-brass/20 hover:brass-glow anim-fade-up anim-delay-${idx + 1}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brass/10 mb-5 group-hover:bg-brass/15 transition-colors">
                  <value.icon className="h-5 w-5 text-brass" />
                </div>
                <h3 className="font-heading text-lg font-bold text-ivory mb-2">
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed text-ivory/50">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

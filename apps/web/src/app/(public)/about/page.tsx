"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Scissors, Award, Heart, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";

interface ContentSectionData {
  title?: string;
  body?: string;
  imageUrl?: string;
  [key: string]: unknown;
}

export default function AboutPage() {
  const [aboutContent, setAboutContent] = useState<ContentSectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<Record<string, ContentSectionData>>("/content")
      .then((res) => {
        if (res.about) {
          setAboutContent(res.about);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const title = aboutContent?.title || "About Us";
  const bodyText =
    aboutContent?.body ||
    `At 360 Yabu, we believe that a great haircut is more than just a trim — it's an experience. Founded with a passion for precision and a commitment to quality, we deliver premium grooming services that leave our clients feeling confident and refreshed.

Our approach combines time-honored barbering techniques with modern styling trends. Whether you're looking for a classic cut, a sharp fade, or a complete style transformation, we bring dedication and attention to detail to every client.`;
  const imageUrl = (aboutContent?.imageUrl as string) || "";

  return (
    <div className="page-transition">
      {/* Hero */}
      <section className="bg-brand py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-linen sm:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-linen/60">
            Where precision meets passion. Every cut tells a story.
          </p>
        </div>
      </section>

      {/* Story & Optional Image */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brass" />
            </div>
          ) : (
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
              {imageUrl && (
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl border border-border bg-muted shadow-md lg:w-1/2">
                  <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              <div className="flex-1 space-y-4 text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                {bodyText}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-border bg-linen py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            What We Stand For
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
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
            ].map((value) => (
              <div
                key={value.title}
                className="flex flex-col items-center gap-4 rounded-lg border border-border bg-background p-8 text-center shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brass/10">
                  <value.icon className="h-6 w-6 text-brass" />
                </div>
                <h3 className="font-heading text-lg font-semibold">
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
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

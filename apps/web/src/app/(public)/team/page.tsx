"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Award, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

interface ContentSectionData {
  title?: string;
  body?: string;
  role?: string;
  specialties?: string;
  imageUrl?: string;
  [key: string]: unknown;
}

export default function TeamPage() {
  const [teamContent, setTeamContent] = useState<ContentSectionData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<Record<string, ContentSectionData>>("/content")
      .then((res) => {
        if (res.team) {
          setTeamContent(res.team);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const name = teamContent?.title || "Professional Barber";
  const role = (teamContent?.role as string) || "Master Barber & Stylist";
  const bio =
    teamContent?.body ||
    "With years of experience in the art of barbering, our master barber brings passion, precision, and creativity to every appointment. Trained in both classic and contemporary techniques, they specialize in delivering cuts that complement each client's unique features and personal style.";
  const specialties =
    (teamContent?.specialties as string) || "Fades, classic cuts, styling";
  const photoUrl = (teamContent?.imageUrl as string) || "";

  return (
    <div className="page-transition">
      {/* Header */}
      <section className="bg-night py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass mb-3 anim-fade-up">
              The Barber
            </p>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-ivory sm:text-5xl anim-fade-up anim-delay-1">
              Meet the Barber
            </h1>
            <p className="mt-4 text-base text-ivory/45 leading-relaxed anim-fade-up anim-delay-2">
              Skilled hands, creative vision, and years of expertise.
            </p>
          </div>
        </div>
      </section>

      {/* Profile */}
      <section className="py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brass" />
            </div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-5 lg:items-start">
              {/* Photo */}
              <div className="lg:col-span-2 anim-fade-up">
                {photoUrl ? (
                  <div className="relative">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border shadow-lg">
                      <Image
                        src={photoUrl}
                        alt={name}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    {/* Decorative accent */}
                    <div className="absolute -bottom-3 -left-3 h-20 w-20 rounded-2xl border border-brass/20 -z-10" />
                  </div>
                ) : (
                  <div className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-border bg-muted shadow-sm">
                    <User className="h-20 w-20 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Bio & Details */}
              <div className="lg:col-span-3 space-y-8 anim-fade-up anim-delay-1">
                <div>
                  <div className="h-1 w-12 rounded-full bg-brass mb-5" />
                  <h2 className="font-heading text-3xl font-bold">{name}</h2>
                  <p className="mt-1.5 text-sm text-brass font-medium">
                    {role}
                  </p>
                </div>

                <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line max-w-2xl">
                  {bio}
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:brass-glow hover:border-brass/20">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brass/10 group-hover:bg-brass/15 transition-colors">
                      <Award className="h-5 w-5 text-brass" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Experience</p>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                        Master-level precision barbering with years of
                        professional training
                      </p>
                    </div>
                  </div>
                  <div className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:brass-glow hover:border-brass/20">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brass/10 group-hover:bg-brass/15 transition-colors">
                      <Sparkles className="h-5 w-5 text-brass" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Specialties</p>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                        {specialties}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-2">
                  <Link href="/book">
                    <Button className="bg-brass text-night hover:bg-brass-light font-semibold gap-2 px-6">
                      Book with {name.split(" ")[0]}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

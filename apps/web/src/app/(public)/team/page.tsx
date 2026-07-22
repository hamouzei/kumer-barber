"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { User, Award, Sparkles, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";

interface ContentSectionData {
  title?: string;
  body?: string;
  role?: string;
  specialties?: string;
  imageUrl?: string;
  [key: string]: unknown;
}

export default function TeamPage() {
  const [teamContent, setTeamContent] = useState<ContentSectionData | null>(null);
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
      {/* Hero */}
      <section className="bg-brand py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-linen sm:text-5xl">
            Meet the Barber
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-linen/60">
            Skilled hands, creative vision, and years of expertise.
          </p>
        </div>
      </section>

      {/* Profile */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brass" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-12 md:flex-row md:items-start">
              {/* Photo Display */}
              {photoUrl ? (
                <div className="relative h-72 w-72 shrink-0 overflow-hidden rounded-2xl border border-brass/20 bg-black shadow-lg">
                  <Image
                    src={photoUrl}
                    alt={name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="flex h-64 w-64 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted shadow-sm">
                  <User className="h-20 w-20 text-muted-foreground/40" />
                </div>
              )}

              {/* Bio & Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="font-heading text-2xl font-bold">
                    {name}
                  </h2>
                  <p className="mt-1 text-sm text-brass font-medium">
                    {role}
                  </p>
                </div>

                <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                  {bio}
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
                    <Award className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
                    <div>
                      <p className="text-sm font-medium">Experience</p>
                      <p className="text-xs text-muted-foreground">
                        Master-level precision barbering
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
                    <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
                    <div>
                      <p className="text-sm font-medium">Specialties</p>
                      <p className="text-xs text-muted-foreground">
                        {specialties}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

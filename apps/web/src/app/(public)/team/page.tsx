import { User, Award, Sparkles } from "lucide-react";

export const metadata = {
  title: "Meet the Barber",
  description:
    "Get to know the skilled barber behind 360 Yabu and their expertise.",
};

export default function TeamPage() {
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
          <div className="flex flex-col items-center gap-12 md:flex-row md:items-start">
            {/* Photo placeholder */}
            <div className="flex h-64 w-64 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted shadow-sm">
              <User className="h-20 w-20 text-muted-foreground/40" />
            </div>

            {/* Bio */}
            <div className="flex-1 space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold">
                  Professional Barber
                </h2>
                <p className="mt-1 text-sm text-brass font-medium">
                  Master Barber & Stylist
                </p>
              </div>

              <p className="text-base leading-relaxed text-muted-foreground">
                With years of experience in the art of barbering, our master
                barber brings passion, precision, and creativity to every
                appointment. Trained in both classic and contemporary techniques,
                they specialize in delivering cuts that complement each
                client&apos;s unique features and personal style.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
                  <Award className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
                  <div>
                    <p className="text-sm font-medium">Experience</p>
                    <p className="text-xs text-muted-foreground">
                      Years of professional barbering
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
                  <div>
                    <p className="text-sm font-medium">Specialties</p>
                    <p className="text-xs text-muted-foreground">
                      Fades, classic cuts, styling
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { Scissors, Award, Heart } from "lucide-react";

export const metadata = {
  title: "About Us",
  description:
    "Learn about 360 Yabu — our story, mission, and commitment to premium grooming.",
};

export default function AboutPage() {
  return (
    <div className="page-transition">
      {/* Hero */}
      <section className="bg-brand py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-linen sm:text-5xl">
            About Us
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-linen/60">
            Where precision meets passion. Every cut tells a story.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
            <p>
              At <strong className="text-foreground">360 Yabu</strong>, we believe
              that a great haircut is more than just a trim — it&apos;s an experience.
              Founded with a passion for precision and a commitment to quality, we
              have been delivering premium grooming services that leave our clients
              feeling confident and refreshed.
            </p>
            <p>
              Our approach combines time-honored barbering techniques with modern
              styling trends. Whether you&apos;re looking for a classic cut, a sharp
              fade, or a complete style transformation, we bring the same level of
              dedication and attention to detail to every client.
            </p>
            <p>
              We take pride in creating a welcoming atmosphere where you can relax,
              unwind, and leave looking your absolute best.
            </p>
          </div>
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

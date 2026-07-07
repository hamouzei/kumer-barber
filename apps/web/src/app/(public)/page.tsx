import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Scissors, Clock, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="page-transition">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand">
        {/* Decorative grain overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')]" />

        <div className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-2 rounded-full border border-linen/10 bg-linen/5 px-4 py-1.5">
            <Scissors className="h-3.5 w-3.5 text-brass" />
            <span className="text-xs font-medium tracking-wider text-linen/60 uppercase">
              Premium Grooming
            </span>
          </div>

          <h1 className="max-w-4xl font-heading text-5xl font-bold tracking-tight text-linen sm:text-6xl lg:text-7xl">
            Look Sharp
            <span className="block text-brass">Every Time</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-linen/60 leading-relaxed">
            Professional haircuts with precision and care.
            Book your appointment online and experience the difference.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/book">
              <Button
                size="lg"
                className="bg-brass text-brand hover:bg-brass-light font-semibold text-base px-8 h-12"
              >
                Book Appointment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/gallery">
              <Button
                size="lg"
                variant="outline"
                className="border-linen/20 text-linen hover:bg-linen/10 text-base px-8 h-12"
              >
                View Our Work
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom edge accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brass/40 to-transparent" />
      </section>

      {/* Value Props */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-0 sm:grid-cols-3">
          {[
            {
              icon: Scissors,
              title: "Expert Craftsmanship",
              description:
                "Years of experience delivering precision cuts that match your style.",
            },
            {
              icon: Clock,
              title: "Easy Online Booking",
              description:
                "Choose your date and time in seconds. No calls, no waiting.",
            },
            {
              icon: Shield,
              title: "Satisfaction Guaranteed",
              description:
                "We stand behind every cut. Your confidence is our priority.",
            },
          ].map((item, index) => (
            <div
              key={item.title}
              className={`flex flex-col items-center gap-3 px-8 py-12 text-center ${
                index < 2 ? "border-b sm:border-b-0 sm:border-r border-border" : ""
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brass/10">
                <item.icon className="h-5 w-5 text-brass" />
              </div>
              <h3 className="font-heading text-base font-semibold">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Strip */}
      <section className="bg-linen">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Ready for a Fresh Look?
          </h2>
          <p className="max-w-lg text-muted-foreground">
            Book your appointment today and experience professional grooming at its finest.
          </p>
          <Link href="/book">
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

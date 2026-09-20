"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { BookingStatus, BusinessSettings } from "@/types";
import { BookingTicket } from "@/components/shared/booking-ticket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  CalendarDays,
  Clock,
  ArrowLeft,
  RefreshCw,
  Copy,
  Check,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TimerOff,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";

function to12Hour(time24: string): string {
  if (!time24) return "";
  const [hStr, mStr] = time24.split(":");
  if (!hStr || !mStr) return time24;
  let h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${suffix}`;
}

const STATUS_CONFIG: Record<
  string,
  {
    title: string;
    message: string;
    icon: React.ElementType;
    color: string;
    bg: string;
  }
> = {
  pending: {
    title: "Booking Submitted",
    message:
      "Your booking request has been received. We will review your payment and confirm shortly.",
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/40",
  },
  approved: {
    title: "Booking Confirmed",
    message:
      "Your appointment has been approved. See you at the scheduled time!",
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/40",
  },
  rejected: {
    title: "Booking Declined",
    message:
      "Unfortunately, your booking could not be approved. Please contact us for more details or try booking again.",
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800/40",
  },
  completed: {
    title: "Visit Complete",
    message: "Thank you for visiting! We hope to see you again soon.",
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/40",
  },
  cancelled: {
    title: "Booking Cancelled",
    message: "This booking has been cancelled.",
    icon: Ban,
    color: "text-muted-foreground",
    bg: "bg-muted border-border",
  },
  expired: {
    title: "Booking Expired",
    message: "This booking has expired. Please create a new booking.",
    icon: TimerOff,
    color: "text-muted-foreground",
    bg: "bg-muted border-border",
  },
};

function BookingStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingRef = searchParams.get("ref");

  const [booking, setBooking] = useState<BookingStatus | null>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [lookupRef, setLookupRef] = useState("");

  useEffect(() => {
    api
      .get<BusinessSettings>("/settings")
      .then(setSettings)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!bookingRef) {
      setBooking(null);
      setError("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    api
      .get<BookingStatus>(`/bookings/${bookingRef}`)
      .then(setBooking)
      .catch(() => {
        setBooking(null);
        setError("Booking not found. Please verify your reference code.");
      })
      .finally(() => setIsLoading(false));
  }, [bookingRef]);

  function handleRefresh() {
    if (!bookingRef) return;
    setIsLoading(true);
    api
      .get<BookingStatus>(`/bookings/${bookingRef}`)
      .then(setBooking)
      .catch(() => setError("Failed to refresh status."))
      .finally(() => setIsLoading(false));
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleLookupSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lookupRef.trim()) return;
    router.push(`/book/status?ref=${lookupRef.trim().toUpperCase()}`);
  }

  if (isLoading && bookingRef) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brass" />
      </div>
    );
  }

  /* ── Lookup Form (no ref provided) ── */
  if (!bookingRef) {
    return (
      <div className="page-transition">
        <section className="bg-night py-12">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-ivory sm:text-4xl">
              Check Booking Status
            </h1>
            <p className="mt-2 text-sm text-ivory/45">
              Track the approval status of your appointment reservation
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="mx-auto max-w-md px-4 sm:px-6">
            <div className="rounded-2xl border border-border bg-card p-7 shadow-sm space-y-5 anim-fade-up">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brass/10 mx-auto">
                <Search className="h-5 w-5 text-brass" />
              </div>
              <form onSubmit={handleLookupSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lookupRef" className="text-sm font-medium">
                    Booking Reference Code
                  </Label>
                  <Input
                    id="lookupRef"
                    placeholder="e.g. KMR-8LV427"
                    value={lookupRef}
                    onChange={(e) => setLookupRef(e.target.value)}
                    className="uppercase font-mono h-11 text-center text-lg tracking-wider"
                  />
                  <p className="text-xs text-muted-foreground leading-normal text-center">
                    Enter the reference code from your booking confirmation.
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={!lookupRef.trim()}
                  className="w-full bg-brass text-night hover:bg-brass-light font-semibold h-11"
                >
                  Check Status
                </Button>
              </form>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ── Not Found ── */
  if (error || !booking) {
    return (
      <div className="page-transition">
        <section className="bg-night py-12">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-ivory sm:text-4xl">
              Booking Not Found
            </h1>
          </div>
        </section>
        <section className="py-14">
          <div className="mx-auto max-w-md px-4 sm:px-6 text-center space-y-5 anim-fade-up">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40 mx-auto">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-sm text-muted-foreground">
              {error || "Something went wrong."}
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/book/status")}
                className="w-full"
              >
                Try Another Code
              </Button>
              <Link href="/book">
                <Button className="w-full bg-brass text-night hover:bg-brass-light font-semibold">
                  Book New Appointment
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ── Booking Found ── */
  const config = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending!;

  return (
    <div className="page-transition">
      {/* Header section with ambient dark aesthetic */}
      <section className="bg-night py-12 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass mb-3 anim-fade-up">
            Reservation Overview
          </p>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-ivory sm:text-4xl anim-fade-up anim-delay-1">
            {config.title}
          </h1>
          <p className="mt-2 text-sm text-ivory/50 max-w-md mx-auto anim-fade-up anim-delay-2">
            {config.message}
          </p>
        </div>
      </section>

      {/* Ticket Showcase Section */}
      <section className="py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-lg space-y-8 anim-fade-up">
          {/* The Modern Downloadable Digital Ticket */}
          <BookingTicket
            booking={booking}
            shopAddress={settings?.address}
            className="w-full"
          />

          {/* Secondary Controls & Navigation */}
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="gap-2 flex-1 font-medium rounded-xl h-11 border-border/80 hover:border-brass/40"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Status
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/book/status")}
                className="flex-1 font-medium rounded-xl h-11 border-border/80 hover:border-brass/40"
              >
                Check Another Booking
              </Button>
            </div>

            <Link href="/book" className="block">
              <Button className="w-full bg-brass text-night hover:bg-brass-light font-semibold gap-2 rounded-xl h-11">
                <ArrowLeft className="h-4 w-4" />
                Book New Appointment
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function BookingStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brass" />
        </div>
      }
    >
      <BookingStatusContent />
    </Suspense>
  );
}

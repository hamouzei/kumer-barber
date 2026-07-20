"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { BookingStatus } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
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
} from "lucide-react";

/** Convert "HH:MM" (24h) → "h:MM AM/PM" (12h) */
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

function BookingStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingRef = searchParams.get("ref");
  
  const [booking, setBooking] = useState<BookingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [lookupRef, setLookupRef] = useState("");

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

  const statusMessages: Record<string, { title: string; message: string }> = {
    pending: {
      title: "Booking Submitted!",
      message:
        "Your booking request has been received. We will review your payment and confirm shortly.",
    },
    approved: {
      title: "Booking Confirmed!",
      message:
        "Your appointment has been approved. See you at the scheduled time!",
    },
    rejected: {
      title: "Booking Declined",
      message:
        "Unfortunately, your booking could not be approved. Please contact us for more details or try booking again.",
    },
    completed: {
      title: "Visit Complete",
      message: "Thank you for visiting! We hope to see you again soon.",
    },
    cancelled: {
      title: "Booking Cancelled",
      message: "This booking has been cancelled.",
    },
    expired: {
      title: "Booking Expired",
      message: "This booking has expired. Please create a new booking.",
    },
  };

  // If loading and we have a ref param
  if (isLoading && bookingRef) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brass" />
      </div>
    );
  }

  // Direct landing or no booking ref provided: Show Lookup Form
  if (!bookingRef) {
    return (
      <div className="page-transition animate-in fade-in duration-300">
        <section className="bg-brand py-12">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-linen sm:text-4xl">
              Check Booking Status
            </h1>
            <p className="mt-2 text-sm text-linen/60">
              Track the approval status of your appointment reservation
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-md px-4 sm:px-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
              <form onSubmit={handleLookupSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lookupRef" className="text-sm font-medium">
                    Booking Reference Code
                  </Label>
                  <div className="relative">
                    <Input
                      id="lookupRef"
                      placeholder="e.g. YBU-8LV427"
                      value={lookupRef}
                      onChange={(e) => setLookupRef(e.target.value)}
                      className="pr-10 uppercase font-mono"
                    />
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-normal">
                    Enter the unique booking reference code provided when you completed your booking.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={!lookupRef.trim()}
                  className="w-full bg-brass text-brand hover:bg-brass-light font-semibold"
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

  // Error case (not found)
  if (error || !booking) {
    return (
      <div className="page-transition animate-in fade-in duration-300">
        <section className="bg-brand py-12">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-linen sm:text-4xl">
              Booking Not Found
            </h1>
          </div>
        </section>
        <section className="py-12">
          <div className="mx-auto max-w-md px-4 sm:px-6 text-center space-y-4">
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm font-medium text-red-800">{error || "Something went wrong."}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/book/status")}
                className="w-full"
              >
                Try Another Code
              </Button>
              <Link href="/book">
                <Button className="w-full bg-brass text-brand hover:bg-brass-light font-semibold">
                  Book New Appointment
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const statusInfo = statusMessages[booking.status] ?? {
    title: "Booking Status",
    message: "",
  };

  return (
    <div className="page-transition animate-in fade-in duration-300">
      <section className="bg-brand py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-linen sm:text-4xl">
            {statusInfo.title}
          </h1>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-lg px-4 sm:px-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            
            {/* Prominent booking reference display + copy button */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Booking Reference
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-foreground tracking-wide">
                    {booking.booking_ref}
                  </span>
                  <button
                    onClick={() => copyToClipboard(booking.booking_ref)}
                    className="rounded-md p-1.5 border border-border bg-muted/30 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
                    title="Copy reference code"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600 animate-in zoom-in-50" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {statusInfo.message}
            </p>

            <div className="space-y-3 rounded-lg bg-muted/30 p-4 border border-border/50">
              <div className="flex items-center gap-3 text-sm">
                <CalendarDays className="h-4 w-4 text-brass shrink-0" />
                <span className="font-medium">
                  {new Date(
                    booking.appointment_date + "T00:00:00"
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-brass shrink-0" />
                <span className="font-medium">
                  {to12Hour(booking.time)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row pt-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="gap-1.5 flex-1 font-semibold"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Status
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/book/status")}
                className="flex-1 font-semibold"
              >
                Check Another Booking
              </Button>
            </div>
            
            <Link href="/book" className="block pt-2">
              <Button
                className="w-full bg-brass text-brand hover:bg-brass-light font-semibold"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                New Booking
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

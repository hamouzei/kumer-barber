"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { BookingStatus } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CalendarDays,
  Clock,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

function BookingStatusContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const [booking, setBooking] = useState<BookingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setError("No booking ID provided.");
      setIsLoading(false);
      return;
    }

    api
      .get<BookingStatus>(`/bookings/${bookingId}`)
      .then(setBooking)
      .catch(() => setError("Booking not found."))
      .finally(() => setIsLoading(false));
  }, [bookingId]);

  function handleRefresh() {
    if (!bookingId) return;
    setIsLoading(true);
    api
      .get<BookingStatus>(`/bookings/${bookingId}`)
      .then(setBooking)
      .catch(() => setError("Failed to refresh."))
      .finally(() => setIsLoading(false));
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brass" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg text-muted-foreground">{error}</p>
        <Link href="/book">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Booking
          </Button>
        </Link>
      </div>
    );
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

  const statusInfo = statusMessages[booking.status] ?? {
    title: "Booking Status",
    message: "",
  };

  return (
    <div className="page-transition">
      <section className="bg-brand py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-linen sm:text-4xl">
            {statusInfo.title}
          </h1>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-lg px-4 sm:px-6">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-semibold text-foreground">
                {booking.booking_ref}
              </span>
              <StatusBadge status={booking.status} />
            </div>

            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              {statusInfo.message}
            </p>

            <div className="mt-6 space-y-3 border-t border-border pt-4">
              <div className="flex items-center gap-3 text-sm">
                <CalendarDays className="h-4 w-4 text-brass" />
                <span>
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
                <Clock className="h-4 w-4 text-brass" />
                <span>{booking.time}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="gap-1.5"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Status
              </Button>
              <Link href="/book" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  New Booking
                </Button>
              </Link>
            </div>
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

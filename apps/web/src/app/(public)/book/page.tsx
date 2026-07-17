"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import type {
  AvailableSlots,
  BusinessSettings,
  CreateBookingResponse,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarDays,
  Clock,
  User,
  CreditCard,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Upload,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Date", icon: CalendarDays },
  { label: "Time", icon: Clock },
  { label: "Details", icon: User },
  { label: "Payment", icon: CreditCard },
  { label: "Confirm", icon: Check },
];

interface BookingState {
  date: string;
  time: string;
  fullName: string;
  phone: string;
  paymentProofUrl: string;
}

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlots | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [booking, setBooking] = useState<BookingState>({
    date: "",
    time: "",
    fullName: "",
    phone: "",
    paymentProofUrl: "",
  });

  const [uploadingProof, setUploadingProof] = useState(false);

  // Fetch available dates + settings on mount
  useEffect(() => {
    Promise.all([
      api.get<string[]>("/availability"),
      api.get<BusinessSettings>("/availability").catch(() => null),
    ])
      .then(([dates]) => {
        setAvailableDates(dates);
      })
      .catch(() => setError("Failed to load availability. Please try again."))
      .finally(() => setIsLoading(false));

    // Fetch business settings (public endpoint)
    api
      .get<BusinessSettings>("/settings")
      .catch(() => null)
      .then((s) => {
        if (s) setSettings(s);
      });
  }, []);

  // Fetch slots when date changes
  const fetchSlots = useCallback(async (date: string) => {
    setSlotsLoading(true);
    try {
      const result = await api.get<AvailableSlots>(`/availability/${date}`);
      setAvailableSlots(result);
    } catch {
      setError("Failed to load time slots.");
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  function handleDateSelect(date: string) {
    setBooking((prev) => ({ ...prev, date, time: "" }));
    setAvailableSlots(null);
    fetchSlots(date);
    setStep(1);
  }

  function handleTimeSelect(time: string) {
    setBooking((prev) => ({ ...prev, time }));
    setStep(2);
  }

  async function handleUploadProof(file: File) {
    setUploadingProof(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("payment_proof", file);
      const result = await api.upload<{ url: string }>(
        "/uploads/payment-proof",
        formData
      );
      setBooking((prev) => ({ ...prev, paymentProofUrl: result.url }));
    } catch {
      setError("Failed to upload payment proof. Please try again.");
    } finally {
      setUploadingProof(false);
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError("");
    try {
      const result = await api.post<CreateBookingResponse>("/bookings", {
        full_name: booking.fullName,
        phone: booking.phone,
        appointment_date: booking.date,
        start_time: booking.time,
        payment_amount: settings ? parseFloat(settings.depositAmount) : 0,
        payment_proof: booking.paymentProofUrl,
      });
      router.push(`/book/status?id=${result.booking_id}`);
    } catch {
      setError("Failed to submit booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function canAdvance(): boolean {
    switch (step) {
      case 0:
        return booking.date !== "";
      case 1:
        return booking.time !== "";
      case 2:
        return booking.fullName.trim().length >= 2 && booking.phone.trim().length >= 9;
      case 3:
        return booking.paymentProofUrl !== "";
      default:
        return true;
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brass" />
      </div>
    );
  }

  return (
    <div className="page-transition">
      {/* Hero */}
      <section className="bg-brand py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-linen sm:text-4xl">
            Book Your Appointment
          </h1>
          <p className="mt-2 text-sm text-linen/60">
            Select your preferred date and time
          </p>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isCompleted = i < step;
            const isCurrent = i === step;

            return (
              <div key={s.label} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                    isCompleted
                      ? "border-brass bg-brass text-brand"
                      : isCurrent
                        ? "border-brass text-brass"
                        : "border-border text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </div>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:block",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 hidden h-px w-8 sm:block lg:w-16",
                      isCompleted ? "bg-brass" : "bg-border"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <section className="py-8">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Step 0: Date Selection */}
          {step === 0 && (
            <div>
              <h2 className="font-heading text-xl font-semibold">
                Select a Date
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose your preferred appointment date
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {availableDates.map((date) => (
                  <button
                    key={date}
                    onClick={() => handleDateSelect(date)}
                    className={cn(
                      "rounded-lg border-2 px-4 py-3 text-center text-sm font-medium transition-all hover:border-brass hover:bg-brass/5",
                      booking.date === date
                        ? "border-brass bg-brass/10 text-foreground"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    <div className="text-xs text-muted-foreground">
                      {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </div>
                    <div className="mt-0.5 font-semibold text-foreground">
                      {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </button>
                ))}
              </div>
              {availableDates.length === 0 && (
                <p className="mt-8 text-center text-muted-foreground">
                  No available dates at the moment. Please check back later.
                </p>
              )}
            </div>
          )}

          {/* Step 1: Time Selection */}
          {step === 1 && (
            <div>
              <h2 className="font-heading text-xl font-semibold">
                Select a Time
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Available slots for {formatDate(booking.date)}
              </p>
              {slotsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-brass" />
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {availableSlots?.slots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => handleTimeSelect(slot.time)}
                      className={cn(
                        "rounded-lg border-2 px-4 py-3 text-center text-sm font-semibold transition-all hover:border-brass hover:bg-brass/5",
                        booking.time === slot.time
                          ? "border-brass bg-brass/10"
                          : "border-border"
                      )}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
              {!slotsLoading && availableSlots?.slots.length === 0 && (
                <p className="mt-8 text-center text-muted-foreground">
                  No available slots for this date. Please select another date.
                </p>
              )}
            </div>
          )}

          {/* Step 2: Personal Details */}
          {step === 2 && (
            <div>
              <h2 className="font-heading text-xl font-semibold">
                Your Details
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell us how to reach you
              </p>
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={booking.fullName}
                    onChange={(e) =>
                      setBooking((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. +251 9XX XXX XXX"
                    value={booking.phone}
                    onChange={(e) =>
                      setBooking((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div>
              <h2 className="font-heading text-xl font-semibold">
                Payment
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Transfer the deposit and upload proof
              </p>

              {settings && (
                <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Deposit Amount
                    </span>
                    <span className="font-heading text-lg font-bold text-brass">
                      {settings.depositAmount} ETB
                    </span>
                  </div>
                  {settings.paymentInstructions && (
                    <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line">
                      {settings.paymentInstructions}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 space-y-4">
                <Label>Upload Payment Proof</Label>
                {booking.paymentProofUrl ? (
                  <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-800">
                        Payment proof uploaded
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setBooking((prev) => ({
                          ...prev,
                          paymentProofUrl: "",
                        }))
                      }
                    >
                      Replace
                    </Button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-brass hover:bg-brass/5">
                    {uploadingProof ? (
                      <Loader2 className="h-8 w-8 animate-spin text-brass" />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {uploadingProof
                        ? "Uploading..."
                        : "Click to upload screenshot or photo"}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadProof(file);
                      }}
                      disabled={uploadingProof}
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div>
              <h2 className="font-heading text-xl font-semibold">
                Confirm Booking
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Please review your booking details
              </p>

              <div className="mt-6 space-y-3 rounded-lg border border-border p-6">
                {[
                  { label: "Date", value: formatDate(booking.date) },
                  { label: "Time", value: booking.time },
                  { label: "Name", value: booking.fullName },
                  { label: "Phone", value: booking.phone },
                  {
                    label: "Deposit",
                    value: settings
                      ? `${settings.depositAmount} ETB`
                      : "—",
                  },
                  {
                    label: "Payment Proof",
                    value: booking.paymentProofUrl ? "✓ Uploaded" : "—",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-sm text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canAdvance()}
                className="gap-1 bg-brass text-brand hover:bg-brass-light font-semibold"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-1 bg-brass text-brand hover:bg-brass-light font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Booking"
                )}
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import type {
  AvailableSlots,
  BusinessSettings,
  CreateBookingResponse,
} from "@/types";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Clock,
  Info,
  Copy,
  Check,
  Loader2,
  Upload,
  AlertCircle,
  Send,
  CalendarDays,
  User,
  CreditCard,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Helpers ─── */

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function to12Hour(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr!, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${suffix}`;
}

function isTimePast(time24: string): boolean {
  const now = new Date();
  const [h, m] = time24.split(":").map(Number);
  return (
    (h ?? 0) < now.getHours() ||
    ((h ?? 0) === now.getHours() && (m ?? 0) <= now.getMinutes())
  );
}

function formatDateLong(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/* ─── Steps ─── */
const STEPS = [
  { key: "date", label: "Date", icon: CalendarDays },
  { key: "time", label: "Time", icon: Clock },
  { key: "details", label: "Details", icon: User },
  { key: "confirm", label: "Confirm", icon: CreditCard },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

/* ─── Component ─── */

interface BookingState {
  date: string;
  time: string;
  fullName: string;
  phone: string;
  paymentProofUrl: string;
}

export default function BookingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlots | null>(
    null
  );
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const [booking, setBooking] = useState<BookingState>({
    date: "",
    time: "",
    fullName: "",
    phone: "",
    paymentProofUrl: "",
  });

  useEffect(() => {
    Promise.all([
      api.get<string[]>("/availability"),
      api.get<BusinessSettings>("/settings").catch(() => null),
    ])
      .then(([dates, s]) => {
        setAvailableDates(dates);
        if (s) setSettings(s);
      })
      .catch(() => setError("Failed to load availability. Please try again."))
      .finally(() => setIsLoading(false));
  }, []);

  /* ── Calendar helpers ── */
  const availableDateSet = useMemo(
    () => new Set(availableDates),
    [availableDates]
  );
  const todayStr = toLocalDateStr(new Date());
  const workingDays = useMemo(
    () => new Set(settings?.workingDays ?? [1, 2, 3, 4, 5, 6]),
    [settings?.workingDays]
  );

  const disabledMatcher = useCallback(
    (date: Date): boolean => {
      const dateStr = toLocalDateStr(date);
      if (dateStr < todayStr) return true;
      if (!workingDays.has(date.getDay())) return true;
      if (!availableDateSet.has(dateStr)) return true;
      return false;
    },
    [todayStr, workingDays, availableDateSet]
  );

  const workingDayModifier = useCallback(
    (date: Date): boolean => {
      const dateStr = toLocalDateStr(date);
      return dateStr >= todayStr && workingDays.has(date.getDay());
    },
    [todayStr, workingDays]
  );

  const selectedDate = booking.date
    ? new Date(booking.date + "T00:00:00")
    : undefined;

  const fetchSlots = useCallback(async (dateStr: string) => {
    setSlotsLoading(true);
    try {
      const result = await api.get<AvailableSlots>(
        `/availability/${dateStr}`
      );
      setAvailableSlots(result);
    } catch {
      setError("Failed to load time slots.");
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  const visibleSlots = useMemo(() => {
    if (!availableSlots) return [];
    const slots = availableSlots.slots;
    if (booking.date === todayStr) {
      return slots.filter((s) => !isTimePast(s.time));
    }
    return slots;
  }, [availableSlots, booking.date, todayStr]);

  /* ── Handlers ── */
  function handleDateSelect(date: Date | undefined) {
    if (!date) return;
    const dateStr = toLocalDateStr(date);
    if (!availableDateSet.has(dateStr)) return;
    setBooking((prev) => ({ ...prev, date: dateStr, time: "" }));
    setAvailableSlots(null);
    fetchSlots(dateStr);
    setCurrentStep(1);
    setError("");
  }

  function handleTimeSelect(time: string) {
    setBooking((prev) => ({ ...prev, time }));
    setCurrentStep(2);
    setError("");
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
    setError("");
    if (!booking.date || !booking.time) {
      setError("Please select a date and time.");
      return;
    }
    if (booking.fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (booking.phone.trim().length < 9) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (!booking.paymentProofUrl) {
      setError("Please upload your payment proof.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await api.post<CreateBookingResponse>("/bookings", {
        full_name: booking.fullName,
        phone: booking.phone,
        appointment_date: booking.date,
        start_time: booking.time,
        payment_amount: settings ? parseFloat(settings.depositAmount) : 0,
        payment_proof: booking.paymentProofUrl,
      });
      router.push(`/book/status?ref=${result.booking_ref}`);
    } catch {
      setError("Failed to submit booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function copyAccount(text: string, idx: number) {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  function goToStep(step: number) {
    if (step < currentStep) {
      setCurrentStep(step);
      setError("");
    }
  }

  function handleDetailsNext() {
    if (booking.fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (booking.phone.trim().length < 9) {
      setError("Please enter a valid phone number.");
      return;
    }
    setError("");
    setCurrentStep(3);
  }

  const isFormComplete =
    booking.date !== "" &&
    booking.time !== "" &&
    booking.fullName.trim().length >= 2 &&
    booking.phone.trim().length >= 9 &&
    booking.paymentProofUrl !== "";

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brass" />
      </div>
    );
  }

  return (
    <div className="page-transition">
      {/* Header */}
      <section className="bg-night py-10">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-ivory sm:text-4xl">
            Book Your Appointment
          </h1>
          <p className="mt-2 text-sm text-ivory/45">
            Four quick steps and you&apos;re all set
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* ─── Step Progress Bar ─── */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isComplete = idx < currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <button
                      onClick={() => goToStep(idx)}
                      disabled={idx > currentStep}
                      className={cn(
                        "flex items-center gap-2 transition-all duration-300",
                        isComplete || isCurrent
                          ? "cursor-pointer"
                          : "cursor-default"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 shrink-0",
                          isComplete
                            ? "border-brass bg-brass text-night"
                            : isCurrent
                              ? "border-brass bg-brass/10 text-brass"
                              : "border-border bg-muted text-muted-foreground"
                        )}
                      >
                        {isComplete ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium hidden sm:inline",
                          isCurrent
                            ? "text-foreground"
                            : isComplete
                              ? "text-brass"
                              : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </span>
                    </button>
                    {idx < STEPS.length - 1 && (
                      <div className="flex-1 mx-2 sm:mx-3">
                        <div className="h-0.5 rounded-full bg-border overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full bg-brass transition-all duration-500",
                              isComplete ? "w-full" : "w-0"
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-in fade-in slide-in-from-top-2 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Main Content */}
            <div className="lg:col-span-8">
              {/* ─── Step 1: Date ─── */}
              {currentStep === 0 && (
                <div className="rounded-2xl border border-border bg-card p-6 anim-fade-up">
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-4">
                    <CalendarDays className="h-4 w-4 text-brass" />
                    Select a Date
                  </h3>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={disabledMatcher}
                      modifiers={{ workday: workingDayModifier }}
                      modifiersClassNames={{ workday: "font-bold" }}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* ─── Step 2: Time ─── */}
              {currentStep === 1 && (
                <div className="rounded-2xl border border-border bg-card p-6 anim-fade-up">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <Clock className="h-4 w-4 text-brass" />
                      Available Times — {formatDateLong(booking.date)}
                    </h3>
                    <button
                      onClick={() => setCurrentStep(0)}
                      className="text-xs text-brass hover:text-brass-light transition-colors flex items-center gap-1"
                    >
                      <ChevronLeft className="h-3 w-3" />
                      Change date
                    </button>
                  </div>

                  {slotsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-5 w-5 animate-spin text-brass" />
                    </div>
                  ) : visibleSlots.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-sm text-muted-foreground">
                        No slots available. Pick another date.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentStep(0)}
                        className="mt-3"
                      >
                        Go Back
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                      {visibleSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => handleTimeSelect(slot.time)}
                          className={cn(
                            "rounded-xl border-2 px-3 py-3 text-center text-sm font-semibold transition-all hover:border-brass hover:bg-brass/5",
                            booking.time === slot.time
                              ? "border-brass bg-brass/10 brass-glow"
                              : "border-border"
                          )}
                        >
                          {to12Hour(slot.time)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── Step 3: Personal Details ─── */}
              {currentStep === 2 && (
                <div className="rounded-2xl border border-border bg-card p-6 anim-fade-up">
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-5">
                    <User className="h-4 w-4 text-brass" />
                    Your Details
                  </h3>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-xs font-medium">
                        Full Name
                      </Label>
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
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="e.g. 09XX XXX XXX"
                        value={booking.phone}
                        onChange={(e) =>
                          setBooking((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={handleDetailsNext}
                      className="bg-brass text-night hover:bg-brass-light font-semibold gap-2 px-6"
                    >
                      Continue
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ─── Step 4: Payment & Confirm ─── */}
              {currentStep === 3 && (
                <div className="space-y-5 anim-fade-up">
                  {/* Booking Policy / Info */}
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
                    <div className="flex items-start gap-3">
                      <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                      <div className="space-y-1.5">
                        <h2 className="font-heading text-sm font-semibold text-amber-900 dark:text-amber-300">
                          Before You Book
                        </h2>
                        {settings?.bookingPolicy ? (
                          <p className="text-sm text-amber-800 dark:text-amber-400/80 whitespace-pre-line leading-relaxed">
                            {settings.bookingPolicy}
                          </p>
                        ) : (
                          <ul className="space-y-1.5 text-sm text-amber-800 dark:text-amber-400/80">
                            <li className="flex items-start gap-2">
                              <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                              A <strong>deposit</strong> is required to confirm
                              {settings && (
                                <span className="font-semibold">
                                  &nbsp;({settings.depositAmount} ETB)
                                </span>
                              )}
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                              Please <strong>arrive on time</strong> — late
                              arrivals may be cancelled
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                              Transfer the deposit, then upload the screenshot
                              below
                            </li>
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Accounts */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="flex items-center gap-2 text-sm font-semibold mb-4">
                      <CreditCard className="h-4 w-4 text-brass" />
                      Transfer Deposit To
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        {
                          name: "CBE (Commercial Bank of Ethiopia)",
                          accountNumber:
                            settings?.cbeAccount || "1000 4821 7365 90",
                          holder:
                            settings?.accountHolder || "Kumer Barbershop",
                          color:
                            "bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800/40",
                          accent: "text-purple-700 dark:text-purple-400",
                          badge:
                            "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
                        },
                        {
                          name: "Telebirr",
                          accountNumber:
                            settings?.telebirrAccount || "0912 345 678",
                          holder:
                            settings?.accountHolder || "Kumer Barbershop",
                          color:
                            "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800/40",
                          accent: "text-green-700 dark:text-green-400",
                          badge:
                            "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
                        },
                      ].map((acc, idx) => (
                        <div
                          key={acc.name}
                          className={cn(
                            "rounded-xl border p-4 transition-colors",
                            acc.color
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                              acc.badge
                            )}
                          >
                            {acc.name.split("(")[0]!.trim()}
                          </span>
                          <div className="mt-2.5 flex items-center justify-between gap-2">
                            <div>
                              <p
                                className={cn(
                                  "font-mono text-lg font-bold tracking-wide",
                                  acc.accent
                                )}
                              >
                                {acc.accountNumber}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {acc.holder}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                copyAccount(acc.accountNumber, idx)
                              }
                              className="shrink-0 rounded-lg border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              title="Copy account number"
                            >
                              {copiedIdx === idx ? (
                                <Check className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {settings?.paymentInstructions && (
                      <p className="mt-3 text-xs text-muted-foreground whitespace-pre-line border-t border-border/50 pt-3">
                        {settings.paymentInstructions}
                      </p>
                    )}
                  </div>

                  {/* Upload Payment Proof */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <Upload className="h-4 w-4 text-brass" />
                      Payment Proof
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Upload a screenshot of your transfer confirmation
                    </p>

                    <div className="mt-4">
                      {booking.paymentProofUrl ? (
                        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/40 dark:bg-emerald-950/30">
                          <Check className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <p className="flex-1 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                            Payment proof uploaded
                          </p>
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
                        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-8 transition-colors hover:border-brass hover:bg-brass/5">
                          {uploadingProof ? (
                            <Loader2 className="h-7 w-7 animate-spin text-brass" />
                          ) : (
                            <Upload className="h-7 w-7 text-muted-foreground" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            {uploadingProof
                              ? "Uploading..."
                              : "Click to upload screenshot or photo"}
                          </span>
                          <span className="text-[11px] text-muted-foreground/60">
                            JPG, PNG, or WEBP · Max 5 MB
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

                  {/* Submit */}
                  <Button
                    onClick={handleSubmit}
                    disabled={!isFormComplete || isSubmitting}
                    className="w-full gap-2 bg-brass py-6 text-base font-semibold text-night hover:bg-brass-light disabled:opacity-40 rounded-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Booking
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* ─── Booking Summary Sidebar ─── */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Booking Summary
                </h4>

                <div className="space-y-3">
                  {booking.date ? (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass/10 shrink-0">
                        <CalendarDays className="h-4 w-4 text-brass" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="text-sm font-medium">
                          {formatDateLong(booking.date)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-muted-foreground/50">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
                        <CalendarDays className="h-4 w-4" />
                      </div>
                      <p className="text-xs">No date selected</p>
                    </div>
                  )}

                  {booking.time ? (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass/10 shrink-0">
                        <Clock className="h-4 w-4 text-brass" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="text-sm font-medium">
                          {to12Hour(booking.time)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-muted-foreground/50">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
                        <Clock className="h-4 w-4" />
                      </div>
                      <p className="text-xs">No time selected</p>
                    </div>
                  )}

                  {booking.fullName ? (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass/10 shrink-0">
                        <User className="h-4 w-4 text-brass" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="text-sm font-medium">
                          {booking.fullName}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-muted-foreground/50">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      <p className="text-xs">No name entered</p>
                    </div>
                  )}

                  {booking.paymentProofUrl && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Payment</p>
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                          Proof uploaded
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {settings?.depositAmount && (
                  <div className="border-t border-border pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Deposit Amount
                      </span>
                      <span className="font-heading text-lg font-bold text-brass">
                        {settings.depositAmount} ETB
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

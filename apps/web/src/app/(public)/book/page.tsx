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
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Helpers ─── */

/** Format a Date to "YYYY-MM-DD" in LOCAL timezone (avoids UTC off-by-one). */
function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Convert "HH:MM" (24h) → "h:MM AM/PM" (12h) */
function to12Hour(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr!, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${suffix}`;
}

/** Check whether "HH:MM" has already passed today. */
function isTimePast(time24: string): boolean {
  const now = new Date();
  const [h, m] = time24.split(":").map(Number);
  return (
    (h ?? 0) < now.getHours() ||
    ((h ?? 0) === now.getHours() && (m ?? 0) <= now.getMinutes())
  );
}

/* ─── Static payment accounts ─── */
const PAYMENT_ACCOUNTS = [
  {
    name: "CBE (Commercial Bank of Ethiopia)",
    accountNumber: "1000 4821 7365 90",
    holder: "Yabu Barber Shop",
    color: "bg-purple-50 border-purple-200",
    accent: "text-purple-700",
    badge: "bg-purple-100 text-purple-800",
  },
  {
    name: "Telebirr",
    accountNumber: "0912 345 678",
    holder: "Yabu Barber Shop",
    color: "bg-green-50 border-green-200",
    accent: "text-green-700",
    badge: "bg-green-100 text-green-800",
  },
];

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

  // Fetch dates + settings on mount
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

  // ─── Calendar helpers ───

  const availableDateSet = useMemo(
    () => new Set(availableDates),
    [availableDates]
  );

  const todayStr = toLocalDateStr(new Date());

  // Working days from settings (0=Sun … 6=Sat). Default Mon-Sat.
  const workingDays = useMemo(
    () => new Set(settings?.workingDays ?? [1, 2, 3, 4, 5, 6]),
    [settings?.workingDays]
  );

  // Calendar `disabled` matcher — disable if:
  //   • day is before today
  //   • day is not a working day
  //   • day is not in the available dates set
  const disabledMatcher = useCallback(
    (date: Date): boolean => {
      const dateStr = toLocalDateStr(date);
      // Past date
      if (dateStr < todayStr) return true;
      // Non-working day
      if (!workingDays.has(date.getDay())) return true;
      // Not in available dates list
      if (!availableDateSet.has(dateStr)) return true;
      return false;
    },
    [todayStr, workingDays, availableDateSet]
  );

  // Bold working-day dates that are in the future
  const workingDayModifier = useCallback(
    (date: Date): boolean => {
      const dateStr = toLocalDateStr(date);
      return dateStr >= todayStr && workingDays.has(date.getDay());
    },
    [todayStr, workingDays]
  );

  // Selected date as a Date object for the calendar
  const selectedDate = booking.date
    ? new Date(booking.date + "T00:00:00")
    : undefined;

  // Fetch time slots when a date is selected
  const fetchSlots = useCallback(
    async (dateStr: string) => {
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
    },
    []
  );

  // Filter out past time slots if the selected date is today
  const visibleSlots = useMemo(() => {
    if (!availableSlots) return [];
    const slots = availableSlots.slots;
    if (booking.date === todayStr) {
      return slots.filter((s) => !isTimePast(s.time));
    }
    return slots;
  }, [availableSlots, booking.date, todayStr]);

  function handleDateSelect(date: Date | undefined) {
    if (!date) return;
    const dateStr = toLocalDateStr(date);
    if (!availableDateSet.has(dateStr)) return;
    setBooking((prev) => ({ ...prev, date: dateStr, time: "" }));
    setAvailableSlots(null);
    fetchSlots(dateStr);
  }

  function handleTimeSelect(time: string) {
    setBooking((prev) => ({ ...prev, time }));
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
      router.push(`/book/status?id=${result.booking_id}`);
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

  function formatDate(dateStr: string): string {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
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
      {/* Hero */}
      <section className="bg-brand py-10">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-linen sm:text-4xl">
            Book Your Appointment
          </h1>
          <p className="mt-2 text-sm text-linen/60">
            Pick a date, choose a time, and you&apos;re all set
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-2xl space-y-6 px-4 sm:px-6">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* ─── Important Info ─── */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-5">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="space-y-1.5">
                <h2 className="font-heading text-base font-semibold text-amber-900">
                  Before You Book
                </h2>
                <ul className="space-y-1 text-sm text-amber-800">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    A <strong>50% deposit</strong> is required to confirm
                    {settings && (
                      <span className="font-semibold">
                        &nbsp;({settings.depositAmount} ETB)
                      </span>
                    )}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    Please <strong>arrive on time</strong> — late arrivals may be
                    cancelled
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    Transfer the deposit, then upload the screenshot below
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* ─── Payment Accounts (CBE & Telebirr) ─── */}
          <div className="rounded-xl border border-border p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <svg
                className="h-4 w-4 text-brass"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                />
              </svg>
              Transfer Deposit To
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {PAYMENT_ACCOUNTS.map((acc, idx) => (
                <div
                  key={acc.name}
                  className={cn(
                    "rounded-lg border p-4 transition-colors",
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
                      onClick={() => copyAccount(acc.accountNumber, idx)}
                      className="shrink-0 rounded-md border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
          </div>

          {/* ─── Date Selection (Mini Calendar) ─── */}
          <div className="rounded-xl border border-border p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <svg
                className="h-4 w-4 text-brass"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
              Select a Date
            </h3>

            <div className="mt-3 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={disabledMatcher}
                modifiers={{
                  workday: workingDayModifier,
                }}
                modifiersClassNames={{
                  workday: "font-bold",
                }}
                className="rounded-lg"
              />
            </div>

            {/* Time slots appear after date selection */}
            {booking.date && (
              <div className="mt-5 border-t border-border pt-5 animate-in fade-in slide-in-from-top-2">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Clock className="h-4 w-4 text-brass" />
                  Available Times — {formatDate(booking.date)}
                </h4>
                {slotsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-brass" />
                  </div>
                ) : visibleSlots.length === 0 ? (
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    No slots available. Pick another date.
                  </p>
                ) : (
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {visibleSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => handleTimeSelect(slot.time)}
                        className={cn(
                          "rounded-lg border-2 px-3 py-2.5 text-center text-sm font-semibold transition-all hover:border-brass hover:bg-brass/5",
                          booking.time === slot.time
                            ? "border-brass bg-brass/10 shadow-sm"
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
          </div>

          {/* ─── Personal Details (appears after time is selected) ─── */}
          {booking.time && (
            <div className="rounded-xl border border-border p-5 animate-in fade-in slide-in-from-top-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <svg
                  className="h-4 w-4 text-brass"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0"
                  />
                </svg>
                Your Details
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs">
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
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs">
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
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── Payment Proof (appears after details are filled) ─── */}
          {booking.fullName.trim().length >= 2 &&
            booking.phone.trim().length >= 9 && (
              <div className="rounded-xl border border-border p-5 animate-in fade-in slide-in-from-top-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Upload className="h-4 w-4 text-brass" />
                  Payment Proof
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Upload a screenshot of your transfer confirmation
                </p>

                <div className="mt-4">
                  {booking.paymentProofUrl ? (
                    <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                      <Check className="h-5 w-5 shrink-0 text-emerald-600" />
                      <p className="flex-1 text-sm font-medium text-emerald-800">
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
                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-brass hover:bg-brass/5">
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
            )}

          {/* ─── Submit ─── */}
          {booking.paymentProofUrl && (
            <div className="pb-8 animate-in fade-in slide-in-from-top-2">
              <Button
                onClick={handleSubmit}
                disabled={!isFormComplete || isSubmitting}
                className="w-full gap-2 bg-brass py-6 text-base font-semibold text-brand hover:bg-brass-light disabled:opacity-40"
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
      </section>
    </div>
  );
}

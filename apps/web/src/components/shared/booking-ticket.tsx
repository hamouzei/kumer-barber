"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Scissors,
  Copy,
  Check,
  Download,
  Printer,
  CalendarDays,
  Clock,
  User,
  MapPin,
  Sparkles,
  CheckCircle2,
  Clock3,
  AlertCircle,
  RotateCcw,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types";

interface BookingTicketProps {
  booking: BookingStatus;
  shopAddress?: string | null;
  className?: string;
  autoPrint?: boolean;
}

function to12Hour(time24: string): string {
  if (!time24) return "";
  const [hStr, mStr] = time24.split(":");
  if (!hStr || !mStr) return time24;
  const h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const formattedH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${formattedH}:${mStr} ${suffix}`;
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Draws a high-resolution, luxury digital pass onto an offscreen HTML5 canvas
 * and triggers an immediate PNG download for the customer.
 */
function generateAndDownloadTicketPng(
  booking: BookingStatus,
  shopAddress?: string | null
) {
  const scale = 2; // High-DPI 2x scale for ultra-crisp output
  const width = 480 * scale;
  const height = 700 * scale;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background - Deep luxury obsidian
  ctx.fillStyle = "#090C10";
  ctx.fillRect(0, 0, width, height);

  // Outer gradient border
  const borderGrad = ctx.createLinearGradient(0, 0, width, height);
  borderGrad.addColorStop(0, "rgba(200, 150, 90, 0.7)");
  borderGrad.addColorStop(0.5, "rgba(200, 150, 90, 0.2)");
  borderGrad.addColorStop(1, "rgba(200, 150, 90, 0.5)");

  const cornerRadius = 24 * scale;
  const inset = 16 * scale;
  const cardW = width - inset * 2;
  const cardH = height - inset * 2;

  // Card Background with rounded corners
  ctx.beginPath();
  ctx.roundRect(inset, inset, cardW, cardH, cornerRadius);
  ctx.fillStyle = "#0E131A";
  ctx.fill();
  ctx.lineWidth = 2 * scale;
  ctx.strokeStyle = borderGrad;
  ctx.stroke();

  // Subtle ambient radial glow at top
  const radialGlow = ctx.createRadialGradient(
    width / 2,
    80 * scale,
    10,
    width / 2,
    80 * scale,
    220 * scale
  );
  radialGlow.addColorStop(0, "rgba(200, 150, 90, 0.12)");
  radialGlow.addColorStop(1, "rgba(200, 150, 90, 0)");
  ctx.fillStyle = radialGlow;
  ctx.fillRect(inset, inset, cardW, 260 * scale);

  // ─── Header: Brand & Pass Title ───
  ctx.textAlign = "center";

  // Gold Scissors Symbol
  ctx.fillStyle = "#C8965A";
  ctx.font = `bold ${18 * scale}px sans-serif`;
  ctx.fillText("✂", width / 2, 60 * scale);

  // Brand Name
  ctx.font = `bold ${16 * scale}px "Space Grotesk", sans-serif`;
  ctx.letterSpacing = "4px";
  ctx.fillStyle = "#F5F0E8";
  ctx.fillText("KUMER BARBERSHOP", width / 2, 85 * scale);

  // Subtitle
  ctx.font = `600 ${10 * scale}px sans-serif`;
  ctx.letterSpacing = "2px";
  ctx.fillStyle = "#C8965A";
  ctx.fillText("OFFICIAL APPOINTMENT PASS", width / 2, 105 * scale);

  // Status Badge on canvas
  const statusLabel =
    booking.status === "approved"
      ? "CONFIRMED"
      : booking.status === "pending"
        ? "PENDING REVIEW"
        : booking.status.toUpperCase();
  const badgeColor =
    booking.status === "approved"
      ? "#10B981"
      : booking.status === "pending"
        ? "#F59E0B"
        : "#9CA3AF";

  ctx.font = `bold ${10 * scale}px sans-serif`;
  ctx.letterSpacing = "1.5px";
  const badgeTextWidth = ctx.measureText(statusLabel).width;
  const badgeBoxW = badgeTextWidth + 24 * scale;
  const badgeBoxH = 22 * scale;
  const badgeBoxX = (width - badgeBoxW) / 2;
  const badgeBoxY = 125 * scale;

  ctx.beginPath();
  ctx.roundRect(badgeBoxX, badgeBoxY, badgeBoxW, badgeBoxH, 11 * scale);
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  ctx.fill();
  ctx.strokeStyle = badgeColor;
  ctx.lineWidth = 1 * scale;
  ctx.stroke();

  ctx.fillStyle = badgeColor;
  ctx.fillText(statusLabel, width / 2, badgeBoxY + 15 * scale);

  // ─── Main Details Grid ───
  ctx.textAlign = "left";
  ctx.letterSpacing = "0px";

  const gridY1 = 195 * scale;
  const col1X = 45 * scale;
  const col2X = width / 2 + 15 * scale;

  // Field: Date
  ctx.fillStyle = "#8E95A2";
  ctx.font = `500 ${10 * scale}px sans-serif`;
  ctx.fillText("DATE", col1X, gridY1);
  ctx.fillStyle = "#F5F0E8";
  ctx.font = `bold ${15 * scale}px sans-serif`;
  ctx.fillText(formatDateDisplay(booking.appointment_date), col1X, gridY1 + 20 * scale);

  // Field: Time
  ctx.fillStyle = "#8E95A2";
  ctx.font = `500 ${10 * scale}px sans-serif`;
  ctx.fillText("TIME", col2X, gridY1);
  ctx.fillStyle = "#C8965A";
  ctx.font = `bold ${16 * scale}px sans-serif`;
  ctx.fillText(to12Hour(booking.time), col2X, gridY1 + 20 * scale);

  const gridY2 = 265 * scale;

  // Field: Customer
  ctx.fillStyle = "#8E95A2";
  ctx.font = `500 ${10 * scale}px sans-serif`;
  ctx.fillText("CLIENT", col1X, gridY2);
  ctx.fillStyle = "#F5F0E8";
  ctx.font = `600 ${14 * scale}px sans-serif`;
  ctx.fillText(booking.customer_name || "Valued Client", col1X, gridY2 + 20 * scale);

  // Field: Location / Deposit
  ctx.fillStyle = "#8E95A2";
  ctx.font = `500 ${10 * scale}px sans-serif`;
  ctx.fillText("LOCATION", col2X, gridY2);
  ctx.fillStyle = "#F5F0E8";
  ctx.font = `500 ${12 * scale}px sans-serif`;
  const locationText = shopAddress ? shopAddress.slice(0, 22) : "Addis Ababa, Ethiopia";
  ctx.fillText(locationText, col2X, gridY2 + 20 * scale);

  // ─── Perforated Tear Line with Notches ───
  const tearY = 345 * scale;

  // Left notch cutout
  ctx.beginPath();
  ctx.arc(inset, tearY, 12 * scale, -Math.PI / 2, Math.PI / 2);
  ctx.fillStyle = "#090C10";
  ctx.fill();
  ctx.strokeStyle = "rgba(200, 150, 90, 0.4)";
  ctx.stroke();

  // Right notch cutout
  ctx.beginPath();
  ctx.arc(width - inset, tearY, 12 * scale, Math.PI / 2, (3 * Math.PI) / 2);
  ctx.fillStyle = "#090C10";
  ctx.fill();
  ctx.strokeStyle = "rgba(200, 150, 90, 0.4)";
  ctx.stroke();

  // Dashed perforation line
  ctx.beginPath();
  ctx.setLineDash([6 * scale, 6 * scale]);
  ctx.moveTo(inset + 18 * scale, tearY);
  ctx.lineTo(width - inset - 18 * scale, tearY);
  ctx.strokeStyle = "rgba(200, 150, 90, 0.35)";
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();
  ctx.setLineDash([]); // Reset dash

  // Mini scissors icon on the line
  ctx.fillStyle = "#C8965A";
  ctx.font = `bold ${10 * scale}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("✂", width / 2, tearY + 4 * scale);

  // ─── Lower Stub: Booking Reference ───
  const stubY = 390 * scale;
  ctx.fillStyle = "#8E95A2";
  ctx.font = `600 ${11 * scale}px sans-serif`;
  ctx.letterSpacing = "2px";
  ctx.fillText("BOOKING REFERENCE", width / 2, stubY);

  // Big Reference Code
  ctx.fillStyle = "#F5F0E8";
  ctx.font = `bold ${26 * scale}px monospace`;
  ctx.letterSpacing = "4px";
  ctx.fillText(booking.booking_ref, width / 2, stubY + 36 * scale);

  // Procedural barcode pattern
  const barcodeY = stubY + 65 * scale;
  const barcodeHeight = 44 * scale;
  const barcodeStart = 60 * scale;
  const barcodeWidth = width - 120 * scale;

  ctx.fillStyle = "#F5F0E8";
  let curX = barcodeStart;
  const refSeed = booking.booking_ref + "KUMERBARBERSHOP";
  let seedIdx = 0;
  while (curX < barcodeStart + barcodeWidth) {
    const charCode = refSeed.charCodeAt(seedIdx % refSeed.length);
    const barW = (1 + (charCode % 4)) * scale;
    const gapW = (1 + ((charCode >> 2) % 3)) * scale;
    ctx.fillRect(curX, barcodeY, barW, barcodeHeight);
    curX += barW + gapW;
    seedIdx++;
  }

  // Footer text
  ctx.fillStyle = "#6B7280";
  ctx.font = `400 ${10 * scale}px sans-serif`;
  ctx.letterSpacing = "1px";
  ctx.fillText("PRESENT THIS DIGITAL PASS UPON ARRIVAL", width / 2, height - 42 * scale);

  // Trigger download
  const link = document.createElement("a");
  link.download = `Kumer-Ticket-${booking.booking_ref}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export function BookingTicket({
  booking,
  shopAddress,
  className,
  autoPrint = true,
}: BookingTicketProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(autoPrint);
  const [printKey, setPrintKey] = useState(0);
  const ticketRef = useRef<HTMLDivElement>(null);

  // Trigger the mechanical printing effect sequence
  const startPrintingSequence = useCallback(() => {
    setIsPrinting(true);
    setPrintKey((prev) => prev + 1);

    // Subtle tactile vibration pattern on mobile devices
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([25, 40, 25, 40, 50, 30, 70]);
      } catch {}
    }

    const timer = setTimeout(() => {
      setIsPrinting(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (autoPrint) {
      const cleanup = startPrintingSequence();
      return cleanup;
    }
  }, [autoPrint, startPrintingSequence]);

  const handleSkipPrinting = () => {
    setIsPrinting(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(booking.booking_ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      generateAndDownloadTicketPng(booking, shopAddress);
    } finally {
      setTimeout(() => setIsDownloading(false), 400);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const statusConfig = {
    approved: {
      label: "Confirmed",
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      icon: CheckCircle2,
    },
    pending: {
      label: "Pending Review",
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      icon: Clock3,
    },
    completed: {
      label: "Completed",
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      icon: CheckCircle2,
    },
    rejected: {
      label: "Declined",
      color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
      icon: AlertCircle,
    },
    cancelled: {
      label: "Cancelled",
      color: "text-neutral-400 border-neutral-500/30 bg-neutral-500/10",
      icon: AlertCircle,
    },
    expired: {
      label: "Expired",
      color: "text-neutral-400 border-neutral-500/30 bg-neutral-500/10",
      icon: AlertCircle,
    },
  }[booking.status] ?? {
    label: booking.status,
    color: "text-brass border-brass/30 bg-brass/10",
    icon: Sparkles,
  };

  const StatusIcon = statusConfig.icon;

  return (
    <div className={cn("flex flex-col items-center gap-6 select-none", className)}>
      {/* ─── Mechanical Dispenser Hood & Feeding Mechanism ─── */}
      <div className="w-full max-w-[420px] relative">
        {/* Dispenser Top Hood Bar */}
        <div className="relative z-30 flex items-center justify-between px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#0C1017] via-[#161C26] to-[#0C1017] border border-brass/30 shadow-[0_6px_25px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(200,150,90,0.4)] backdrop-blur-md">
          {/* LED Status Indicator */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              {isPrinting ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                </>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_#10B981]" />
                </>
              )}
            </span>
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ivory/80">
              {isPrinting ? (
                <span className="flex items-center gap-1.5 text-amber-300">
                  <span>Printing Pass</span>
                  <span className="inline-flex gap-0.5">
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                    <span className="animate-bounce delay-300">.</span>
                  </span>
                </span>
              ) : (
                <span className="text-emerald-400 font-medium">Pass Ready • Collect Below</span>
              )}
            </span>
          </div>

          {/* Machine Brand Badge or Skip Button */}
          <div className="flex items-center gap-2">
            {isPrinting ? (
              <button
                type="button"
                onClick={handleSkipPrinting}
                className="text-[10px] font-medium text-ivory/50 hover:text-brass transition-colors px-2 py-0.5 rounded border border-white/10 hover:border-brass/30"
              >
                Skip
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-brass/80 text-xs">
                <Scissors className="h-3 w-3 text-brass" />
                <span className="font-heading text-[10px] font-bold tracking-widest uppercase">
                  Kumer Pass
                </span>
              </div>
            )}
          </div>
        </div>

        {/* The Dispenser Mouth / Slit with Shadow Depth */}
        <div className="relative z-20 -mt-1 mx-auto w-[94%] h-2 rounded-full bg-black border-b border-brass/40 shadow-[inset_0_3px_5px_rgba(0,0,0,0.95)]" />

        {/* ─── Ticket Extrusion Container ─── */}
        <div className="relative overflow-hidden -mt-1 pt-1 pb-4 flex justify-center">
          <div
            key={printKey}
            ref={ticketRef}
            id="kumer-ticket"
            className={cn(
              "relative w-full rounded-3xl p-[1.5px] bg-gradient-to-b from-brass/50 via-brass/20 to-brass/45 shadow-[0_12px_45px_rgba(0,0,0,0.7)] transition-all duration-300 hover:shadow-[0_16px_55px_rgba(200,150,90,0.2)]",
              isPrinting && "animate-ticket-feed"
            )}
            style={{
              transformOrigin: "top center",
            }}
          >
            {/* Thermal Printhead Laser Beam Effect during Printing */}
            {isPrinting && (
              <div className="pointer-events-none absolute inset-x-0 z-40 animate-thermal-laser">
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-brass to-transparent shadow-[0_0_15px_#C8965A,0_0_6px_#FFF]" />
                <div className="h-6 w-full bg-gradient-to-b from-brass/20 to-transparent blur-[2px]" />
              </div>
            )}

            {/* Inner Ticket Card */}
            <div className="relative overflow-hidden rounded-[23px] bg-[#0C1017] text-ivory">
              {/* Ambient lighting glow */}
              <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-72 rounded-full bg-brass/15 blur-3xl" />

              {/* ═══════ UPPER STUB: BRAND & DETAILS ═══════ */}
              <div className="p-6 sm:p-7 pb-6 space-y-6">
                {/* Header: Logo, Brand & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brass/15 border border-brass/30 shadow-inner">
                      <Scissors className="h-5 w-5 text-brass" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-bold tracking-tight text-ivory">
                        Kumer Barbershop
                      </h3>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brass">
                        Appointment Pass
                      </p>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-sm",
                      statusConfig.color
                    )}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    <span>{statusConfig.label}</span>
                  </div>
                </div>

                {/* Details Matrix */}
                <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white/[0.03] p-4 border border-white/[0.06] backdrop-blur-md">
                  {/* Date */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ivory/50">
                      <CalendarDays className="h-3 w-3 text-brass" />
                      Date
                    </div>
                    <p className="text-sm font-bold text-ivory">
                      {formatDateDisplay(booking.appointment_date)}
                    </p>
                  </div>

                  {/* Time */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ivory/50">
                      <Clock className="h-3 w-3 text-brass" />
                      Time
                    </div>
                    <p className="text-sm font-bold text-brass">
                      {to12Hour(booking.time)}
                    </p>
                  </div>

                  {/* Client */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ivory/50">
                      <User className="h-3 w-3 text-brass" />
                      Guest
                    </div>
                    <p className="text-sm font-medium text-ivory truncate">
                      {booking.customer_name || "Valued Client"}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ivory/50">
                      <MapPin className="h-3 w-3 text-brass" />
                      Location
                    </div>
                    <p className="text-xs font-medium text-ivory/80 truncate">
                      {shopAddress || "Addis Ababa"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ═══════ PERFORATION LINE WITH NOTCHES ═══════ */}
              <div className="relative flex items-center justify-between">
                {/* Left cutout notch */}
                <div className="absolute -left-3.5 h-7 w-7 rounded-full bg-background border border-brass/30 shadow-inner" />

                {/* Perforated dashed divider */}
                <div className="mx-6 w-full border-t-2 border-dashed border-brass/30 flex items-center justify-center">
                  <span className="relative -top-2.5 px-2 bg-[#0C1017] text-brass text-[10px] select-none">
                    ✂
                  </span>
                </div>

                {/* Right cutout notch */}
                <div className="absolute -right-3.5 h-7 w-7 rounded-full bg-background border border-brass/30 shadow-inner" />
              </div>

              {/* ═══════ LOWER STUB: REFERENCE & BARCODE ═══════ */}
              <div className="p-6 sm:p-7 pt-5 space-y-4 text-center">
                {/* Booking Code with Prominent Copy Action */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory/45">
                    Booking Reference
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-2xl font-bold tracking-widest text-ivory">
                      {booking.booking_ref}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 active:scale-95",
                        copied
                          ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                          : "border-white/10 bg-white/5 text-ivory/70 hover:border-brass/40 hover:bg-brass/10 hover:text-brass"
                      )}
                      title="Copy reference code"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 animate-in zoom-in-50" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {copied && (
                    <p className="text-xs text-emerald-400 font-medium animate-in fade-in slide-in-from-top-1">
                      Reference code copied to clipboard!
                    </p>
                  )}
                </div>

                {/* Procedural Barcode Aesthetic */}
                <div className="pt-1 flex flex-col items-center gap-1.5">
                  <div className="flex items-end justify-center gap-[2.5px] h-11 w-full max-w-[280px] px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.04]">
                    {Array.from({ length: 42 }).map((_, i) => {
                      const heights = [60, 85, 45, 100, 70, 90, 50, 80];
                      const heightPct = heights[(i * 7 + 3) % heights.length];
                      const isGold = i % 11 === 0;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "w-[2px] sm:w-[3px] rounded-full transition-colors",
                            isGold ? "bg-brass" : "bg-ivory/60"
                          )}
                          style={{ height: `${heightPct}%` }}
                        />
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-ivory/35 tracking-wider uppercase">
                    Present this pass upon arrival
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Action Controls: Download PNG, Copy Code, Print & Replay ─── */}
      <div
        className={cn(
          "flex flex-wrap items-center justify-center gap-3 w-full max-w-[420px] transition-all duration-500",
          isPrinting ? "opacity-40 pointer-events-none scale-95" : "opacity-100 scale-100"
        )}
      >
        {/* Download Ticket Image */}
        <Button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading || isPrinting}
          className="flex-1 min-w-[170px] bg-brass text-night hover:bg-brass-light font-semibold h-11 gap-2 rounded-xl shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download className="h-4 w-4" />
          {isDownloading ? "Generating..." : "Download Ticket"}
        </Button>

        {/* Copy Reference */}
        <Button
          type="button"
          variant="outline"
          onClick={handleCopy}
          disabled={isPrinting}
          className="min-w-[130px] border-border/80 bg-card hover:border-brass/40 hover:text-brass font-medium h-11 gap-2 rounded-xl"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-500" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy Code</span>
            </>
          )}
        </Button>

        {/* Print / Save PDF */}
        <Button
          type="button"
          variant="outline"
          onClick={handlePrint}
          disabled={isPrinting}
          className="border-border/80 bg-card hover:border-brass/40 hover:text-brass font-medium h-11 px-3.5 rounded-xl"
          title="Print Ticket"
        >
          <Printer className="h-4 w-4" />
        </Button>

        {/* Replay Printing Animation Button */}
        <Button
          type="button"
          variant="ghost"
          onClick={startPrintingSequence}
          disabled={isPrinting}
          className="text-ivory/50 hover:text-brass hover:bg-white/5 text-xs h-9 px-3 gap-1.5 rounded-lg"
          title="Replay printing animation"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Replay Print</span>
        </Button>
      </div>

      {/* ─── Embedded Keyframe Animations for Mechanical Feed ─── */}
      <style jsx>{`
        @keyframes ticketFeedOut {
          0% {
            transform: translateY(-80%);
            clip-path: inset(0 0 95% 0);
            opacity: 0.1;
          }
          15% {
            opacity: 0.95;
          }
          35% {
            clip-path: inset(0 0 65% 0);
            transform: translateY(-50%);
          }
          60% {
            clip-path: inset(0 0 35% 0);
            transform: translateY(-22%);
          }
          85% {
            clip-path: inset(0 0 10% 0);
            transform: translateY(-5%);
          }
          95% {
            clip-path: inset(0 0 0% 0);
            transform: translateY(4px);
          }
          100% {
            clip-path: inset(0 0 0% 0);
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes thermalLaserBeam {
          0% {
            top: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            top: 98%;
            opacity: 0;
          }
        }

        .animate-ticket-feed {
          animation: ticketFeedOut 2.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .animate-thermal-laser {
          animation: thermalLaserBeam 2.2s ease-in-out forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-ticket-feed,
          .animate-thermal-laser {
            animation: none !important;
            transform: none !important;
            clip-path: none !important;
          }
        }
      `}</style>
    </div>
  );
}

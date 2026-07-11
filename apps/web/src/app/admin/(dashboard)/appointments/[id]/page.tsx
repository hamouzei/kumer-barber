"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/api-client";
import type { AppointmentDetail } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  ArrowLeft,
  CalendarDays,
  Clock,
  User,
  Phone,
  CreditCard,
  CheckCircle,
  XCircle,
  Ban,
} from "lucide-react";

export default function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [detail, setDetail] = useState<AppointmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    api
      .get<AppointmentDetail>(`/admin/appointments/${id}`)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleAction(
    action: "approve" | "reject" | "complete" | "cancel"
  ) {
    setActionLoading(true);
    try {
      const body = action === "reject" ? { reason: rejectReason } : undefined;
      await api.patch(`/admin/appointments/${id}/${action}`, body);
      // Refresh detail
      const updated = await api.get<AppointmentDetail>(
        `/admin/appointments/${id}`
      );
      setDetail(updated);
    } catch {
      // Error handled by API client
    } finally {
      setActionLoading(false);
      setShowApprove(false);
      setShowReject(false);
      setShowComplete(false);
      setShowCancel(false);
      setRejectReason("");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brass" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Appointment not found.
      </div>
    );
  }

  const isPending = detail.status === "pending";
  const isApproved = detail.status === "approved";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Booking #{detail.booking_id}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Created{" "}
            {new Date(detail.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <StatusBadge status={detail.status} className="text-sm" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{detail.customer.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{detail.customer.phone}</span>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Appointment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {new Date(
                  detail.appointment.date + "T00:00:00"
                ).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {detail.appointment.time} – {detail.appointment.end_time}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">
                {detail.payment.amount} ETB
              </span>
            </div>
            {detail.payment.proof && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                <Image
                  src={detail.payment.proof}
                  alt="Payment proof"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rejection Reason */}
        {detail.rejection_reason && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-red-600">
                Rejection Reason
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {detail.rejection_reason}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      {(isPending || isApproved) && (
        <div className="flex flex-wrap gap-3 border-t border-border pt-6">
          {isPending && (
            <>
              <Button
                onClick={() => setShowApprove(true)}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowReject(true)}
                className="gap-1.5"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </>
          )}
          {isApproved && (
            <Button
              onClick={() => setShowComplete(true)}
              className="gap-1.5 bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="h-4 w-4" />
              Mark Completed
            </Button>
          )}
          {(isPending || isApproved) && (
            <Button
              variant="outline"
              onClick={() => setShowCancel(true)}
              className="gap-1.5"
            >
              <Ban className="h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={showApprove}
        onOpenChange={setShowApprove}
        title="Approve Booking"
        description="This will confirm the appointment. The customer will be notified."
        confirmLabel="Approve"
        onConfirm={() => handleAction("approve")}
        isLoading={actionLoading}
      />

      <ConfirmationDialog
        open={showReject}
        onOpenChange={setShowReject}
        title="Reject Booking"
        description="Please provide a reason for rejection (optional)."
        confirmLabel="Reject"
        variant="destructive"
        onConfirm={() => handleAction("reject")}
        isLoading={actionLoading}
      >
        <Textarea
          placeholder="Reason for rejection..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="mt-2"
        />
      </ConfirmationDialog>

      <ConfirmationDialog
        open={showComplete}
        onOpenChange={setShowComplete}
        title="Mark as Completed"
        description="This will mark the appointment as completed."
        confirmLabel="Complete"
        onConfirm={() => handleAction("complete")}
        isLoading={actionLoading}
      />

      <ConfirmationDialog
        open={showCancel}
        onOpenChange={setShowCancel}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking? The customer will be notified."
        confirmLabel="Cancel Booking"
        variant="destructive"
        onConfirm={() => handleAction("cancel")}
        isLoading={actionLoading}
      />
    </div>
  );
}

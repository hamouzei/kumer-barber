"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import type { CustomerDetail } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, User, Phone, StickyNote, Loader2 } from "lucide-react";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<CustomerDetail>(`/admin/customers/${id}`)
      .then(setCustomer)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brass" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Customer not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          {customer.fullName}
        </h1>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Customer Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{customer.fullName}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{customer.phone}</span>
          </div>
          {customer.notes && (
            <div className="flex items-start gap-3">
              <StickyNote className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {customer.notes}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            Customer since{" "}
            {new Date(customer.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </CardContent>
      </Card>

      {/* Appointment History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Appointment History ({customer.appointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customer.appointments.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No appointments yet
            </p>
          ) : (
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.appointments.map((apt) => (
                    <TableRow key={apt.appointmentId}>
                      <TableCell className="text-sm">
                        {new Date(
                          apt.appointmentDate + "T00:00:00"
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {apt.startTime.slice(0, 5)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={apt.status} />
                      </TableCell>
                      <TableCell className="text-sm">
                        {apt.paymentAmount} ETB
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

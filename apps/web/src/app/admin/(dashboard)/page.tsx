"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { DashboardSummary } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Clock,
  Users,
  DollarSign,
  ClipboardList,
  ArrowRight,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardSummary>("/admin/dashboard")
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brass" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Failed to load dashboard data.
      </div>
    );
  }

  const stats = [
    {
      label: "Today's Appointments",
      value: data.todayAppointments,
      icon: CalendarDays,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Pending Bookings",
      value: data.pendingBookings,
      icon: Clock,
      color: "text-amber-600 bg-amber-100",
    },
    {
      label: "Completed Today",
      value: data.completedToday,
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-100",
    },
    {
      label: "Monthly Revenue",
      value: `${data.monthlyRevenue.toLocaleString()} ETB`,
      icon: DollarSign,
      color: "text-brass bg-brass/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your barbershop activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-heading text-xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Pending */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">
            Recent Pending Bookings
          </CardTitle>
          <Link href="/admin/appointments?status=pending">
            <Button variant="ghost" size="sm" className="gap-1 text-brass">
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {data.recentPending.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No pending bookings
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentPending.map((booking) => (
                <Link
                  key={booking.appointmentId}
                  href={`/admin/appointments/${booking.appointmentId}`}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {booking.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.customerPhone}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(
                        booking.appointmentDate + "T00:00:00"
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.startTime.slice(0, 5)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

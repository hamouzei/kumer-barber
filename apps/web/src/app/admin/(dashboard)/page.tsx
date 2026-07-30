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
  ArrowRight,
  Loader2,
  CheckCircle,
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
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Pending Bookings",
      value: data.pendingBookings,
      icon: Clock,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "Completed Today",
      value: data.completedToday,
      icon: CheckCircle,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      label: "Monthly Revenue",
      value: `${data.monthlyRevenue.toLocaleString()} ETB`,
      icon: DollarSign,
      iconColor: "text-brass",
      iconBg: "bg-brass/10",
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
            <Card key={stat.label} className="border-border">
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-heading text-xl font-bold mt-0.5">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Pending */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">
            Recent Pending Bookings
          </CardTitle>
          <Link href="/admin/appointments?status=pending">
            <Button variant="ghost" size="sm" className="gap-1 text-brass hover:text-brass-light">
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {data.recentPending.length === 0 ? (
            <div className="py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mx-auto mb-3">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No pending bookings
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.recentPending.map((booking) => (
                <Link
                  key={booking.appointmentId}
                  href={`/admin/appointments/${booking.appointmentId}`}
                  className="flex items-center justify-between rounded-xl border border-border p-3.5 transition-all hover:bg-muted/50 hover:border-brass/15"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
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

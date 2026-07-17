"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import type { Appointment } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CalendarDays, Clock } from "lucide-react";
import { format } from "date-fns";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setIsLoading(true);
    api
      .get<{ data: Appointment[] }>(`/admin/appointments?date=${dateStr}&limit=100`)
      .then((res) => setAppointments(res.data))
      .catch(() => setAppointments([]))
      .finally(() => setIsLoading(false));
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Calendar
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View appointments by date
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        {/* Calendar Picker */}
        <Card className="w-fit">
          <CardContent className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) setSelectedDate(date);
              }}
            />
          </CardContent>
        </Card>

        {/* Day's Appointments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4 text-brass" />
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-brass" />
              </div>
            ) : appointments.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No appointments for this date
              </p>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div
                    key={apt.appointmentId}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {apt.startTime.slice(0, 5)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {apt.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {apt.customerPhone}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

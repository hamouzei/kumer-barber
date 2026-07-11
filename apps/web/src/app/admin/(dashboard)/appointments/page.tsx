"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { Appointment, PaginatedResponse } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

function AppointmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<PaginatedResponse<Appointment> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("limit", "15");

      const result = await api.get<PaginatedResponse<Appointment>>(
        `/admin/appointments?${params.toString()}`
      );
      setData(result);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, [status, search, page]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Appointments
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage all booking requests and appointments
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(val) => {
            setStatus(!val || val === "all" ? "" : val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-brass" />
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No appointments found.
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((apt) => (
                  <TableRow key={apt.appointmentId}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">
                          {apt.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {apt.customerPhone}
                        </p>
                      </div>
                    </TableCell>
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
                    <TableCell>
                      <Link href={`/admin/appointments/${apt.appointmentId}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * 15 + 1}–
                {Math.min(page * 15, data.pagination.total)} of{" "}
                {data.pagination.total}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brass" />
        </div>
      }
    >
      <AppointmentsContent />
    </Suspense>
  );
}

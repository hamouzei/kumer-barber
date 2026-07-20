/* ─── Business Types ─── */

export interface BusinessSettings {
  settingId: number;
  haircutPrice: string;
  depositAmount: string;
  durationMinutes: number;
  openingTime: string;
  closingTime: string;
  workingDays: number[];
  paymentInstructions: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  address: string | null;
  socialLinks: Record<string, string>;
}

export interface WebsiteContent {
  hero?: {
    title: string;
    body: string;
    subtitle?: string;
    ctaText?: string;
  };
  about?: {
    title: string;
    body: string;
    mission?: string;
    experience?: string;
    story?: string;
  };
  team?: {
    title: string;
    body: string;
    name?: string;
    photo?: string;
    experience?: string;
    specialties?: string;
  };
}

export interface GalleryImage {
  imageId: number;
  title: string | null;
  imageUrl: string;
  cloudinaryPublicId: string;
  displayOrder: number;
  createdAt: string;
}

export interface Customer {
  customerId: number;
  fullName: string;
  phone: string;
  notes: string | null;
  createdAt: string;
  totalVisits?: number;
  lastVisit?: string | null;
}

export interface CustomerDetail extends Customer {
  appointments: Appointment[];
}

export type AppointmentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | "cancelled"
  | "expired";

export interface Appointment {
  appointmentId: number;
  bookingRef: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  paymentAmount: string;
  paymentProof: string | null;
  rejectionReason: string | null;
  createdAt: string;
  customerName?: string;
  customerPhone?: string;
}

export interface AppointmentDetail {
  booking_id: number;
  booking_ref: string;
  customer: {
    id: number;
    name: string;
    phone: string;
  };
  appointment: {
    date: string;
    time: string;
    end_time: string;
  };
  payment: {
    amount: string;
    proof: string | null;
  };
  status: AppointmentStatus;
  rejection_reason: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface BookingStatus {
  booking_id: number;
  booking_ref: string;
  status: AppointmentStatus;
  appointment_date: string;
  time: string;
}

export interface TimeSlot {
  time: string;
}

export interface AvailableSlots {
  date: string;
  slots: TimeSlot[];
}

export interface Notification {
  notificationId: number;
  type: string;
  appointmentId: number;
  recipientType: "admin" | "customer";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminNotifications {
  notifications: Notification[];
  unreadCount: number;
}

export interface DashboardSummary {
  todayAppointments: number;
  pendingBookings: number;
  approvedBookings: number;
  completedToday: number;
  cancelledTotal: number;
  monthlyRevenue: number;
  recentPending: Array<{
    appointmentId: number;
    appointmentDate: string;
    startTime: string;
    paymentAmount: string;
    createdAt: string;
    customerName: string;
    customerPhone: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* ─── Booking Form Types ─── */

export interface BookingFormData {
  full_name: string;
  phone: string;
  appointment_date: string;
  start_time: string;
  payment_amount: number;
  payment_proof: string;
}

export interface CreateBookingResponse {
  booking_id: number;
  booking_ref: string;
  status: string;
  message: string;
}

export interface WebsiteContentSection {
  contentId: number;
  sectionKey: string;
  title: string | null;
  body: string | null;
  metadata: Record<string, unknown> | null;
  updatedAt: string;
}

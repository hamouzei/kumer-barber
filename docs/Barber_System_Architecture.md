# System Architecture

## Barber Booking & Business Management System

## 1. Architecture Overview

The system follows a modern three-tier architecture:

``` text
+----------------------+
|  Public Website      |
|  (Next.js / React)   |
+----------+-----------+
           |
           v
+----------------------+
| Booking Flow         |
| Customer Forms       |
| Authentication (Admin)|
+----------+-----------+
           |
           v
+----------------------+
| Backend (Supabase)   |
| - Auth              |
| - PostgreSQL        |
| - Storage           |
| - Edge Functions    |
+----+----------+------+
     |          |
     |          |
     v          v
Appointments  Media Storage
Customers     Payment Proofs
Settings      Gallery Images
```

## 2. Major Components

### Public Website

-   Home
-   About
-   Service Gallery
-   Meet the Barber
-   Book Now entry point
-   Responsive UI

### Booking Module

-   Date selection
-   Available slot generation
-   Customer details
-   Payment instructions
-   Payment proof upload
-   Booking request submission

### Admin Dashboard

-   Dashboard overview
-   Appointment management
-   Calendar
-   Payment verification
-   Customer management
-   Website content management
-   Business settings

## 3. Data Flow

1.  Customer opens the website.
2.  Customer selects a date and an available time.
3.  Customer enters personal information.
4.  Customer uploads payment proof.
5.  Booking is stored with **Pending Review** status.
6.  The selected slot is temporarily reserved.
7.  Barber reviews the request.
8.  If approved, the slot becomes permanently unavailable.
9.  If rejected or expired, the slot becomes available again.

## 4. Database Layer

Core tables:

-   appointments
-   customers
-   business_settings
-   website_content
-   gallery
-   admin_users

Relationships:

-   One customer can have many appointments.
-   Business settings define slot generation.
-   Gallery and website content are managed by the administrator.

## 5. Storage

Supabase Storage stores:

-   Payment screenshots
-   Gallery images
-   Barber profile image

Database stores only file URLs.

## 6. Security

-   Admin authentication via Supabase Auth.
-   Role-based access for admin features.
-   Public users cannot access dashboard resources.
-   Row Level Security (RLS) enabled.
-   Input validation on all forms.
-   HTTPS in production.

## 7. Slot Management

Business rules:

-   One appointment equals one hour.
-   Only one booking per slot.
-   Pending bookings reserve a slot.
-   Approved bookings permanently block the slot.
-   Rejected or expired bookings release the slot.

## 8. Technology Stack

### Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   shadcn/ui

### Backend

-   Supabase
-   PostgreSQL
-   Supabase Auth
-   Supabase Storage
-   Edge Functions (optional)

### Deployment

-   Vercel (Frontend)
-   Supabase (Backend)

## 9. Scalability

Architecture supports future expansion: - Multiple services - Multiple
barbers - Online payments - SMS/Email notifications - Customer
accounts - Analytics - Multi-branch support - Mobile applications

## 10. Design Principles

-   Modular architecture
-   Mobile-first
-   Secure by default
-   Scalable data model
-   Separation of presentation, business logic, and data
-   Maintainable and extensible codebase

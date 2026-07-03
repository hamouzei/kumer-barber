# API Specification

# Barber Booking & Business Management System

**Version:** v1.0  
**Architecture:** REST API  
**Data Format:** JSON  
**Authentication:** JWT Bearer Token (Admin Only)

---

# Base URL

```
https://yourdomain.com/api/v1
```

---

# API Overview

The API consists of two categories:

- Public APIs (Customer)
- Protected APIs (Admin)

---

# Authentication

Only the barber (administrator) needs authentication.

Customers do not create accounts.

Admin Authentication:

```
Authorization: Bearer <JWT_TOKEN>
```

---

# Public APIs

---

## Get Website Content

### GET

```
/website
```

### Description

Returns all public website information.

### Response

```json
{
  "hero": {
    "title": "Professional Barber",
    "subtitle": "Look Sharp Every Time"
  },
  "about": {},
  "gallery": [],
  "team": {}
}
```

---

## Get Available Dates

### GET

```
/availability
```

### Description

Returns all available booking dates.

### Response

```json
[
    "2026-07-10",
    "2026-07-11",
    "2026-07-12"
]
```

---

## Get Available Time Slots

### GET

```
/availability/{date}
```

Example

```
/availability/2026-07-10
```

### Response

```json
{
    "date":"2026-07-10",
    "slots":[
        "09:00",
        "10:00",
        "13:00",
        "14:00"
    ]
}
```

Unavailable slots are not returned.

---

## Upload Payment Proof

### POST

```
/uploads/payment-proof
```

### Request

Multipart Form Data

```
payment_proof : File
```

### Response

```json
{
    "url":"uploads/payment-proof/abc123.jpg"
}
```

---

## Create Booking

### POST

```
/bookings
```

### Request

```json
{
    "full_name":"Ahmed Ali",
    "phone":"0912345678",
    "appointment_date":"2026-07-10",
    "start_time":"09:00",
    "payment_amount":250,
    "payment_proof":"uploads/payment-proof/abc123.jpg"
}
```

### Response

```json
{
    "booking_id":27,
    "status":"pending_review",
    "message":"Booking request submitted successfully."
}
```

---

## Get Booking Status

### GET

```
/bookings/{bookingId}
```

### Response

```json
{
    "booking_id":27,
    "status":"approved",
    "appointment_date":"2026-07-10",
    "time":"09:00"
}
```

---

# Admin APIs

---

## Login

### POST

```
/admin/login
```

### Request

```json
{
    "email":"admin@example.com",
    "password":"password"
}
```

### Response

```json
{
    "token":"JWT_TOKEN"
}
```

---

# Dashboard

## Get Dashboard Summary

### GET

```
/admin/dashboard
```

### Response

```json
{
    "todayAppointments":6,
    "pendingBookings":3,
    "completedToday":2,
    "monthlyRevenue":12000
}
```

---

# Appointment Management

---

## Get All Appointments

### GET

```
/admin/appointments
```

Optional Query Parameters

```
status
date
page
limit
```

Example

```
/admin/appointments?status=pending_review
```

---

## Get Appointment Details

### GET

```
/admin/appointments/{id}
```

### Response

```json
{
    "booking_id":27,
    "customer":{
        "name":"Ahmed",
        "phone":"0912345678"
    },
    "appointment":{
        "date":"2026-07-10",
        "time":"09:00"
    },
    "payment":{
        "amount":250,
        "proof":"..."
    }
}
```

---

## Approve Booking

### PATCH

```
/admin/appointments/{id}/approve
```

### Response

```json
{
    "status":"approved"
}
```

---

## Reject Booking

### PATCH

```
/admin/appointments/{id}/reject
```

### Request

```json
{
    "reason":"Payment not received."
}
```

### Response

```json
{
    "status":"rejected"
}
```

---

## Complete Appointment

### PATCH

```
/admin/appointments/{id}/complete
```

### Response

```json
{
    "status":"completed"
}
```

---

## Cancel Appointment

### PATCH

```
/admin/appointments/{id}/cancel
```

### Response

```json
{
    "status":"cancelled"
}
```

---

# Customer Management

---

## Get Customers

### GET

```
/admin/customers
```

---

## Get Customer Details

### GET

```
/admin/customers/{id}
```

### Response

```json
{
    "name":"Ahmed",
    "phone":"0912345678",
    "appointments":[]
}
```

---

# Gallery Management

---

## Get Gallery

### GET

```
/gallery
```

---

## Upload Gallery Image

### POST

```
/admin/gallery
```

Multipart Form Data

```
image
title
```

---

## Update Gallery Image

### PUT

```
/admin/gallery/{id}
```

---

## Delete Gallery Image

### DELETE

```
/admin/gallery/{id}
```

---

# Website Content Management

---

## Get Website Content

### GET

```
/admin/content
```

---

## Update Hero Section

### PUT

```
/admin/content/hero
```

---

## Update About Section

### PUT

```
/admin/content/about
```

---

## Update Meet the Barber

### PUT

```
/admin/content/team
```

---

# Business Settings

---

## Get Settings

### GET

```
/admin/settings
```

---

## Update Settings

### PUT

```
/admin/settings
```

### Request

```json
{
    "haircut_price":500,
    "deposit_amount":250,
    "opening_time":"09:00",
    "closing_time":"18:00",
    "appointment_duration":60
}
```

---

# File Upload Rules

Supported formats

- JPG
- PNG
- WEBP

Maximum Size

```
5 MB
```

---

# Appointment Status Flow

```
Pending Review
        │
        ├────────► Approved
        │              │
        │              ▼
        │         Completed
        │
        ├────────► Rejected
        │
        ├────────► Cancelled
        │
        └────────► Expired
```

---

# HTTP Status Codes

| Code | Meaning |
|-------|----------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Booking Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

# Business Rules

- Customers do not need an account.
- Phone number identifies the customer.
- Every appointment lasts exactly **60 minutes**.
- Only one booking can exist for a given time slot.
- Pending bookings temporarily reserve a slot.
- Approved bookings permanently block the slot.
- Rejected, cancelled, and expired bookings release the slot.
- Payment proof is mandatory before a booking request is created.
- Only authenticated administrators can access admin endpoints.

---

# Future API Versions

Future versions may include:

- Customer authentication
- Online payment integration (Chapa, Telebirr)
- SMS and WhatsApp notifications
- Reviews and ratings
- Loyalty program
- Multi-barber support
- Multi-service support
- Mobile application APIs
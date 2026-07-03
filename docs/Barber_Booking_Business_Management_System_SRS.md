# Software Requirements Specification (SRS)

# Barber Booking & Business Management System

## 1. Introduction

### 1.1 Purpose

The purpose of this project is to develop a modern **Barber Booking &
Business Management System** that enables customers to book appointments
online while allowing the barber to efficiently manage bookings,
payments, schedules, customers, and website content from a centralized
dashboard.

The system aims to eliminate manual appointment scheduling, reduce
customer no-shows through deposit verification, and provide a
professional online presence.

### 1.2 Scope

The system consists of two major components:

#### Public Website

-   Home
-   About
-   Service Gallery
-   Meet the Barber
-   Book Now (Booking System Entry)

#### Business Management System

-   Dashboard
-   Appointment Management
-   Calendar
-   Payment Verification
-   Customer Management
-   Website Content Management
-   Business Settings

## 2. Objectives

-   Provide a professional online presence.
-   Simplify appointment booking.
-   Prevent double bookings.
-   Reduce no-shows through deposit verification.
-   Improve customer experience.
-   Centralize appointment management.
-   Support future scalability.

## 3. Stakeholders

### Primary Stakeholder

-   Barber Shop Owner

### Secondary Stakeholders

-   Customers

### System Administrator

-   Barber

## 4. User Roles

### Visitor

Can:

-   Browse the website
-   View gallery
-   Read about the barber
-   View service information
-   Start the booking process

### Customer

Can:

-   Select a date
-   Select an available time slot
-   Enter name and phone number
-   View payment instructions
-   Upload payment proof
-   Submit a booking request
-   View booking status

### Barber (Administrator)

Can:

-   Log in securely
-   View dashboard
-   Approve or reject bookings
-   Verify payment screenshots
-   Manage appointments
-   Manage customers
-   Edit website content
-   Configure business settings

## 5. Functional Requirements

### Module 1 -- Public Website

#### Home Page

The homepage shall include:

-   Hero section
-   Business introduction
-   Call-to-action
-   Book Now button
-   Testimonials (optional)
-   Footer

#### About

Display:

-   Barber biography
-   Experience
-   Mission
-   Shop story

#### Service Gallery

Display:

-   Haircut service
-   Duration (60 minutes)
-   Price
-   Deposit amount
-   Portfolio images

#### Meet the Barber

Display:

-   Photo
-   Name
-   Experience
-   Specialties

------------------------------------------------------------------------

### Module 2 -- Booking System

#### Booking Workflow

1.  Customer clicks **Book Now**.
2.  Selects a date.
3.  Selects an available time slot.
4.  Enters name and phone number.
5.  Views payment instructions.
6.  Uploads payment screenshot.
7.  Submits booking request.

The booking status is initially **Pending Review**.

#### Appointment Availability

The system shall:

-   Generate available one-hour time slots.
-   Hide unavailable slots.
-   Block approved appointments immediately.
-   Temporarily reserve pending appointments until approved, rejected,
    or expired.

#### Booking Statuses

-   Pending Review
-   Approved
-   Rejected
-   Completed
-   Cancelled
-   Expired

#### Payment Verification

The barber shall:

-   View uploaded payment proof.
-   Approve or reject payment.
-   Approve or reject booking.

#### Notifications

Customers receive:

-   Booking submitted
-   Booking approved
-   Appointment reminder
-   Appointment completed

The barber receives:

-   New booking notification

------------------------------------------------------------------------

### Module 3 -- Business Management System

#### Dashboard

Display:

-   Today's appointments
-   Pending bookings
-   Approved bookings
-   Completed appointments
-   Cancelled appointments
-   Revenue summary

#### Appointment Management

The administrator can:

-   Search appointments
-   Filter appointments
-   Approve
-   Reject
-   Complete
-   Cancel
-   View payment proof

#### Calendar

Provide:

-   Daily view
-   Weekly view
-   Monthly view
-   Color-coded appointment statuses

#### Customer Management

Store:

-   Customer name
-   Phone number
-   Appointment history
-   Total visits
-   Notes

#### Business Settings

Configure:

-   Opening hours
-   Closing hours
-   Working days
-   Appointment duration
-   Haircut price
-   Deposit amount
-   Payment instructions
-   Contact information
-   Social links

#### Website Content Management

Manage:

-   Homepage
-   About section
-   Gallery
-   Meet the Barber
-   Business information

## 6. Non-Functional Requirements

### Performance

-   Fast page loading
-   Responsive booking process
-   Smooth dashboard performance

### Security

-   Secure administrator authentication
-   Protected customer data
-   Secure payment proof storage
-   Input validation
-   HTTPS in production

### Reliability

-   Prevent duplicate bookings
-   Handle concurrent booking requests safely
-   Regular backups

### Usability

-   Mobile-first responsive design
-   Intuitive booking flow
-   Clean and accessible interface

### Scalability

The architecture should support future expansion to:

-   Multiple services
-   Multiple barbers
-   Online payments
-   SMS and email notifications
-   Customer accounts
-   Loyalty programs
-   Multi-location support

## 7. Future Enhancements

-   Multiple services
-   Multiple barbers
-   Integrated online payments
-   WhatsApp/SMS reminders
-   Customer accounts
-   Discount coupons
-   Loyalty rewards
-   Analytics dashboard
-   Inventory management
-   Product sales
-   Mobile applications

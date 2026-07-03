# Database Design

## Barber Booking & Business Management System (MySQL)

# 1. Overview

The database is normalized to Third Normal Form (3NF) and is designed
for a single barber with one service while remaining extensible.

## 2. Entity Relationship Diagram (ERD)

``` text
+--------------+        +------------------+
| customers    |1      *| appointments     |
+--------------+--------+------------------+
| customer_id PK|       | appointment_id PK|
| full_name     |       | customer_id FK   |
| phone UNIQUE  |       | appointment_date |
| created_at    |       | start_time       |
+--------------+       | end_time         |
                       | status           |
                       | payment_amount   |
                       | payment_proof    |
                       | created_at       |
                       +--------+---------+
                                |
                                |
                                | * 
                                | 1
                       +--------v---------+
                       | business_settings|
                       +------------------+
                       | setting_id PK    |
                       | haircut_price    |
                       | deposit_amount   |
                       | duration_minutes |
                       | opening_time     |
                       | closing_time     |
                       +------------------+

+--------------+
| gallery      |
+--------------+
| image_id PK  |
| title        |
| image_url    |
| display_order|
+--------------+

+--------------+
| website_content |
+--------------+
| content_id PK|
| section_key  |
| title        |
| body         |
+--------------+

+--------------+
| admin_users  |
+--------------+
| admin_id PK  |
| email UNIQUE |
| password_hash|
+--------------+
```

# 3. Tables

## customers

  Column        Type           Constraints
  ------------- -------------- ---------------------------
  customer_id   BIGINT         PK AUTO_INCREMENT
  full_name     VARCHAR(100)   NOT NULL
  phone         VARCHAR(20)    UNIQUE NOT NULL
  created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP

## appointments

  -------------------------------------------------------------------------------------------------------------------------
  Column                  Type                                                                      Constraints
  ----------------------- ------------------------------------------------------------------------- -----------------------
  appointment_id          BIGINT                                                                    PK AUTO_INCREMENT

  customer_id             BIGINT                                                                    FK -\>
                                                                                                    customers.customer_id

  appointment_date        DATE                                                                      NOT NULL

  start_time              TIME                                                                      NOT NULL

  end_time                TIME                                                                      NOT NULL

  status                  ENUM('pending','approved','rejected','completed','cancelled','expired')   NOT NULL

  payment_amount          DECIMAL(10,2)                                                             NOT NULL

  payment_proof           VARCHAR(255)                                                              NULL

  created_at              TIMESTAMP                                                                 DEFAULT
                                                                                                    CURRENT_TIMESTAMP
  -------------------------------------------------------------------------------------------------------------------------

## business_settings

Single-row configuration table.

  Column             Type
  ------------------ ---------------
  setting_id         INT PK
  haircut_price      DECIMAL(10,2)
  deposit_amount     DECIMAL(10,2)
  duration_minutes   INT
  opening_time       TIME
  closing_time       TIME

## gallery

Stores portfolio images.

## website_content

Stores editable homepage/about/team content.

## admin_users

Stores administrator credentials.

# 4. Relationships

-   One Customer → Many Appointments (1:N)
-   One Business Settings record → Governs all appointment generation.
-   Gallery and Website Content are managed by Admin Users.

# 5. Business Rules

-   One appointment occupies one 60-minute slot.
-   Only one approved or pending appointment can exist for a given
    date/time.
-   Rejected, cancelled, and expired appointments release the slot.
-   Customers are identified by phone number.
-   Payment proof is required before review.

# 6. Indexes

-   customers(phone) UNIQUE
-   appointments(appointment_date,start_time)
-   appointments(status)
-   appointments(customer_id)

# 7. Future Extensions

Reserved for: - services - barbers - working_days - notifications -
reviews - payments - coupons

CREATE TABLE `admin_users` (
	`admin_id` bigint AUTO_INCREMENT NOT NULL,
	`email` varchar(100) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_users_admin_id` PRIMARY KEY(`admin_id`),
	CONSTRAINT `admin_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `appointments` (
	`appointment_id` bigint AUTO_INCREMENT NOT NULL,
	`booking_ref` varchar(12) NOT NULL,
	`customer_id` bigint NOT NULL,
	`appointment_date` date NOT NULL,
	`start_time` time NOT NULL,
	`end_time` time NOT NULL,
	`status` enum('pending','approved','rejected','completed','cancelled','expired') NOT NULL DEFAULT 'pending',
	`payment_amount` decimal(10,2) NOT NULL,
	`payment_proof` varchar(500),
	`rejection_reason` varchar(500),
	`version` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_appointment_id` PRIMARY KEY(`appointment_id`),
	CONSTRAINT `idx_appointments_booking_ref` UNIQUE(`booking_ref`)
);
--> statement-breakpoint
CREATE TABLE `business_settings` (
	`setting_id` int NOT NULL,
	`haircut_price` decimal(10,2) NOT NULL,
	`deposit_amount` decimal(10,2) NOT NULL,
	`duration_minutes` int NOT NULL DEFAULT 60,
	`opening_time` time NOT NULL,
	`closing_time` time NOT NULL,
	`working_days` json NOT NULL DEFAULT ('[1,2,3,4,5,6]'),
	`payment_instructions` text,
	`cbe_account` varchar(50),
	`telebirr_account` varchar(50),
	`account_holder` varchar(100),
	`booking_policy` text,
	`contact_phone` varchar(20),
	`contact_email` varchar(100),
	`address` text,
	`google_maps_url` text,
	`social_links` json DEFAULT ('{}'),
	CONSTRAINT `business_settings_setting_id` PRIMARY KEY(`setting_id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`customer_id` bigint AUTO_INCREMENT NOT NULL,
	`full_name` varchar(100) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customers_customer_id` PRIMARY KEY(`customer_id`),
	CONSTRAINT `customers_phone_unique` UNIQUE(`phone`)
);
--> statement-breakpoint
CREATE TABLE `gallery` (
	`image_id` bigint AUTO_INCREMENT NOT NULL,
	`title` varchar(100),
	`image_url` varchar(500) NOT NULL,
	`cloudinary_public_id` varchar(255) NOT NULL,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gallery_image_id` PRIMARY KEY(`image_id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`notification_id` bigint AUTO_INCREMENT NOT NULL,
	`notification_type` enum('new_booking','booking_approved','booking_rejected','booking_completed','booking_cancelled') NOT NULL,
	`appointment_id` bigint NOT NULL,
	`recipient_type` enum('admin','customer') NOT NULL,
	`title` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`is_read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_notification_id` PRIMARY KEY(`notification_id`)
);
--> statement-breakpoint
CREATE TABLE `website_content` (
	`content_id` bigint AUTO_INCREMENT NOT NULL,
	`section_key` varchar(50) NOT NULL,
	`title` varchar(200),
	`body` text,
	`metadata` json,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `website_content_content_id` PRIMARY KEY(`content_id`),
	CONSTRAINT `website_content_section_key_unique` UNIQUE(`section_key`)
);
--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_customer_id_customers_customer_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_appointment_id_appointments_appointment_id_fk` FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`appointment_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_appointments_date_time` ON `appointments` (`appointment_date`,`start_time`);--> statement-breakpoint
CREATE INDEX `idx_appointments_status` ON `appointments` (`status`);--> statement-breakpoint
CREATE INDEX `idx_appointments_customer` ON `appointments` (`customer_id`);
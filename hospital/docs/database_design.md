# Database Design

This document summarizes the relational schema used by the hospital system. It is derived from the JPA entities under `hospital/src/main/java/com/hospital/entity`. The legacy `disease` table exists for backward compatibility but is no longer used for new features.

## Core Tables

### user
- `id` (PK, bigint, identity)
- `username` (varchar(50), unique, not null)
- `password` (varchar(100), not null)
- `display_name` (varchar(50))
- `email` (varchar(120), unique)
- `phone` (varchar(20), unique)
- `role` (enum: DOCTOR, PATIENT, ADMIN, not null)
- `status` (enum: ACTIVE, INACTIVE, PENDING, default ACTIVE)
- `created_at`, `updated_at`, `last_login_at` (timestamp)

### patient
- `id` (PK, bigint, identity)
- `user_id` (FK → user.id, unique, not null)
- `name` (varchar(50), not null)
- `gender` (enum: MALE, FEMALE, not null)
- `age` (int, not null)
- `id_card` (varchar(18), unique, not null)
- `phone` (varchar(11), not null)
- `address` (varchar(200))
- `created_at`, `updated_at` (timestamp)
- Notes: service layer expects linked user.role = PATIENT.

### doctor
- `id` (PK, bigint, identity)
- `user_id` (FK → user.id, unique, not null)
- `name` (varchar(50), not null)
- `gender` (enum: MALE, FEMALE, not null)
- `title` (varchar(50), not null)
- `phone` (varchar(11), not null)
- `avatar_url` (varchar(255), default `/files/Default.gif`)
- `department_id` (FK → department.id, not null)
- `created_at`, `updated_at` (timestamp)
- Notes: many-to-many `doctor_disease` join table exists but the disease domain is currently unused.

### department
- `id` (PK, bigint, identity)
- `code` (varchar(30), unique, indexed, not null)
- `name` (varchar(100), unique, indexed, not null)
- `lead_name` (varchar(50))
- `rooms` (int)
- `status` (enum: OPEN, PAUSED, ADJUSTING, default OPEN)
- `focus` (varchar(200))
- `created_at`, `updated_at` (timestamp)

### schedule
- `id` (PK, bigint, identity)
- `doctor_id` (FK → doctor.id, not null)
- `department_id` (FK → department.id, not null)
- `work_date` (date, not null)
- `start_time`, `end_time` (time, not null)
- `type` (enum: REGULAR, SPECIALIST, EXTRA, not null)
- `status` (enum: OPEN, RUNNING, FULL, PAUSED, default OPEN)
- `capacity` (int, default 0)
- `booked` (int, default 0)
- `created_at`, `updated_at` (timestamp)

### registration
- `id` (PK, bigint, identity)
- `patient_id` (FK → patient.id, not null)
- `doctor_id` (FK → doctor.id, not null)
- `disease_id` (FK → disease.id, nullable; legacy field, not used by current flows)
- `schedule_id` (FK → schedule.id, nullable)
- `registration_time` (timestamp, default now)
- `appointment_time` (timestamp, not null)
- `type` (enum: REGULAR, SPECIALIST, EXTRA, default REGULAR)
- `channel` (enum: ONLINE, OFFLINE, default ONLINE)
- `status` (enum: WAITING, CONFIRMED, COMPLETED, CANCELLED, default WAITING)
- `fee` (decimal(12,2))
- `payment_status` (enum: UNPAID, PAID, REFUNDED, default UNPAID)
- `notes` (text)
- `created_at`, `updated_at` (timestamp)

### medical_record
- `id` (PK, bigint, identity)
- `patient_id` (FK → patient.id, not null)
- `doctor_id` (FK → doctor.id, not null)
- `registration_id` (FK → registration.id, not null)
- `visit_date` (timestamp, default now)
- `symptoms` (text)
- `diagnosis` (text)
- `medication` (text) — comma-separated list
- `examinations` (text)
- `treatment` (text)
- `notes` (text)
- `created_at`, `updated_at` (timestamp)

### announcement
- `id` (PK, bigint, identity)
- `title` (varchar(200), not null)
- `content` (text)
- `status` (enum: DRAFT, PUBLISHED, SCHEDULED, default DRAFT)
- `audience_scope` (varchar(200))
- `publish_at` (timestamp)
- `creator_id` (FK → user.id)
- `created_at`, `updated_at` (timestamp)

### disease (legacy / unused)
- `id` (PK, bigint, identity)
- `name` (varchar(100), not null)
- `description` (text)
- `created_at`, `updated_at` (timestamp)
- Notes: table kept for compatibility; new features should avoid storing or depending on this data.

## Relationships
- `user` 1↔1 `patient` and 1↔1 `doctor` (exclusive per role).
- `doctor` ↔ `department`: many-to-one.
- `doctor` ↔ `schedule`: one-to-many.
- `registration` links `patient`, `doctor`, optional `schedule`; status and payment tracked on the same row.
- `medical_record` links back to `registration`, `patient`, and `doctor`.
- `announcement` optionally references the creator `user`.
- `doctor_disease` join table exists but disease data is not used operationally.

## Status Enums (API-facing mappings)
- Registration: WAITING→pending, CONFIRMED→processing, COMPLETED→completed, CANCELLED→cancelled.
- Payment: UNPAID, PAID, REFUNDED.
- Schedule: OPEN, RUNNING, FULL, PAUSED.
- User status: ACTIVE, INACTIVE, PENDING.
- Announcement: DRAFT, PUBLISHED, SCHEDULED.

## Notes and Constraints
- Timestamps are maintained via entity lifecycle callbacks; `created_at` is set on insert, `updated_at` on each update.
- Service layer validates role consistency (e.g., doctor.user.role must be DOCTOR, patient.user.role must be PATIENT).
- Department has unique indexes on `code` and `name`.
- Patient `id_card`, user `username/email/phone`, and the patient/doctor `user_id` links are unique.
- Disease fields are retained only for legacy data; new workflows should not rely on them.

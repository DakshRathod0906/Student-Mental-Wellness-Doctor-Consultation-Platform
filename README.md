# WellHealth – Student Mental Wellness & Doctor Consultation Platform

## Overview

WellHealth is a full-stack mental wellness platform designed specifically for students. The platform helps students track their mental well-being through validated psychological assessments, personal journaling, wellness analytics, and professional doctor consultations.

The system provides separate dashboards for Students, Doctors, and Administrators, enabling a complete wellness ecosystem.

---

## Key Features

### Student Features

* Secure Authentication & Authorization
* Personal Dashboard
* Wellness Journey Tracking
* Journal Management
* Mood Tracking
* PHQ-9 Depression Assessment
* GAD-7 Anxiety Assessment
* PSS-10 Stress Assessment
* WHO-5 Well-Being Assessment
* Appointment Booking
* Notification Center
* Profile Management
* Wellness Analytics

### Doctor Features

* Doctor Dashboard
* Appointment Management
* Availability Management
* Student Assessment Review
* Student Wellness Monitoring
* Consultation Notes
* Follow-Up Recommendations

### Admin Features

* User Management
* Doctor Management
* Appointment Monitoring
* Assessment Analytics
* Platform Analytics
* Communication & Email Center
* Notification Management

---

# Technology Stack

## Frontend

* React.js
* React Router
* Axios
* Recharts
* CSS3
* Context API

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Nodemailer

## Database

MongoDB

---

# System Modules

## Authentication Module

Features:

* Registration
* Login
* JWT Authentication
* Role-Based Access Control
* Password Management

Roles:

* Student
* Doctor
* Admin

---

## Journal Module

Students can:

* Create Journals
* Edit Journals
* Delete Journals
* Mark Journals as Private
* Share Journals with Doctors
* Track Mood Entries

Journal Features:

* Timeline View
* Calendar View
* Mood Filters
* Activity Statistics

---

## Assessment Module

The platform supports four validated assessments.

### PHQ-9

Purpose:

Depression Screening

Range:

0–27

Categories:

* Minimal
* Mild
* Moderate
* Moderately Severe
* Severe

---

### GAD-7

Purpose:

Anxiety Screening

Range:

0–21

Categories:

* Minimal
* Mild
* Moderate
* Severe

---

### PSS-10

Purpose:

Perceived Stress Measurement

Range:

0–40

Categories:

* Low Stress
* Moderate Stress
* High Stress

---

### WHO-5

Purpose:

Well-Being Measurement

Range:

0–25

Categories:

* Poor Well-Being
* Good Well-Being

---

## Wellness Index

The Wellness Index combines all four assessments into a single score.

Formula:

Wellness Index =

(PHQ × 0.3)

* (GAD × 0.3)
* (PSS × 0.2)
* (WHO × 0.2)

Range:

0–100

Categories:

* 80–100: Excellent
* 60–79: Good
* 40–59: Moderate
* 20–39: Concerning
* 0–19: Critical

---

## Appointment Module

Features:

* Doctor Discovery
* Doctor Profiles
* Slot Booking
* Appointment Tracking

Appointment Flow:

Requested
→ Confirmed
→ Completed
→ Reviewed

---

## Doctor Notes Module

Doctors can:

* Create Session Notes
* Add Recommendations
* Schedule Follow-Ups
* Track Student Progress

---

## Notification Module

Notification Types:

* Assessment
* Appointment
* Journal
* Doctor Note
* System

Categories:

* Today
* Yesterday
* This Week
* Older

---

## Communication & Email Center

Features:

* Email Templates
* Automated Emails
* Appointment Confirmation Emails
* Appointment Reminder Emails
* Assessment Result Emails
* Email Logs
* Email Analytics

---

# Database Collections

## Users

```javascript
{
  _id,
  role,
  name,
  email,
  password,
  profile
}
```

## Assessments

```javascript
{
  _id,
  userId,
  type,
  score,
  severity,
  interpretation,
  recommendation,
  answers,
  completedAt
}
```

## Journals

```javascript
{
  _id,
  userId,
  title,
  content,
  mood,
  visibility,
  createdAt
}
```

## Appointments

```javascript
{
  _id,
  studentId,
  doctorId,
  date,
  status,
  notes
}
```

## DoctorAvailability

```javascript
{
  _id,
  doctorId,
  availableSlots
}
```

## DoctorNotes

```javascript
{
  _id,
  appointmentId,
  doctorId,
  studentId,
  notes,
  recommendations,
  followUpRequired,
  followUpDate
}
```

## Notifications

```javascript
{
  _id,
  userId,
  type,
  title,
  message,
  read
}
```

## EmailTemplates

```javascript
{
  _id,
  name,
  category,
  subject,
  body,
  variables
}
```

## EmailCampaigns

```javascript
{
  _id,
  title,
  audience,
  templateId,
  status,
  scheduledAt
}
```

## EmailLogs

```javascript
{
  _id,
  recipient,
  subject,
  status,
  sentAt,
  openedAt
}
```

---

# Dashboard Structure

## Student Dashboard

* Wellness Index
* Quick Actions
* Assessment Summary
* Mood Check-In
* Upcoming Appointments
* Recent Activities
* Trend Charts

---

## Doctor Dashboard

* Today's Sessions
* Assigned Students
* Pending Notes
* Student Activity Feed
* Student Wellness Summary

---

## Admin Dashboard

* User Statistics
* Appointment Statistics
* Assessment Statistics
* Latest Registrations
* Latest Appointments
* Latest Assessments
* Email & Communication Center

---

# UI/UX Design Principles

Design Inspiration:

* Linear
* Stripe
* Vercel
* Notion

Features:

* Responsive Layout
* Modern Dashboard Design
* Smooth Animations
* Empty States
* Loading Skeletons
* Semantic Color System
* Accessibility Support

---

# Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/wellhealth.git
```

## Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Install Backend Dependencies

```bash
cd backend
npm install
```

## Environment Variables

Create a .env file inside backend:

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret

EMAIL_USER=your_email

EMAIL_PASS=your_password
```

## Run Backend

```bash
npm run dev
```

## Run Frontend

```bash
npm start
```

---

# Future Enhancements

* University Integration
* Mobile Application
* Advanced Wellness Analytics
* Teleconsultation
* Multi-Language Support
* Wellness Resource Library

---

# Academic Information

Project Type:
Full Stack Development (FSD-2)

Tech Stack:
React + Express + MongoDB

Architecture:
Role-Based Multi-User Mental Wellness Platform

Developed For:
Student Mental Wellness & Doctor Consultation Management

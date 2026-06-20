# Student Mental Wellness & Doctor Consultation Platform
## Comprehensive Revised Specification (PRD, TRD, and SRS)

---

## 1. Executive Summary & Context

This document serves as the unified reference for the **Student Mental Wellness & Doctor Consultation Platform**. It addresses the critical gaps identified in the original PRD, TRD, and SRS reviews, ensuring a consistent design across requirements, database schema, APIs, and UML diagrams.

### Clinical Assessment Standards
- **PHQ-9 (Patient Health Questionnaire-9)**: A clinically accepted 9-question depression screening instrument. The platform aggregates responses (each scored 0-3) to yield a total score of 0-27, categorizing depression severity (None, Mild, Moderate, Moderately Severe, Severe) and recommending next steps.
- **GAD-7 (Generalized Anxiety Disorder-7)**: A standardized 7-question anxiety screening instrument. Responses (scored 0-3) yield a total score of 0-21, categorizing anxiety severity (None, Mild, Moderate, Severe) to prompt clinical attention.

---

## 2. Updated Entity Schemas & Database Design

### 2.1 MongoDB Collections Schema (MERN Stack Integration)

#### A. User Collection
```javascript
{
  _id: ObjectId,
  role: 'student' | 'doctor' | 'admin',
  email: String (unique, lowercase),
  passwordHash: String,
  firstName: String,
  lastName: String,
  phoneNumber: String (E.164 format),
  status: 'active' | 'inactive' | 'suspended',
  isEmailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### B. Appointment Collection
```javascript
{
  _id: ObjectId,
  studentId: ObjectId, // Link to Student (User)
  doctorId: ObjectId,   // Link to Doctor (User)
  scheduledDate: Date,
  scheduledTime: String,           // HH:MM format
  duration: Number,                // in minutes (default: 30)
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled"],
    default: "scheduled"
  },
  doctorNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### C. Notification Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,    // Target User (Student or Doctor)
  message: String,
  isRead: Boolean,
  type: 'appointment_reminder' | 'assessment_prompt' | 'general',
  createdAt: Date                  // Timestamp
}
```

#### D. Journal Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  content: String,
  mood: 'very_sad' | 'sad' | 'neutral' | 'happy' | 'very_happy',
  tags: String[],
  visibility: 'private' | 'doctor_visible',
  createdAt: Date,
  updatedAt: Date
}
```

#### E. Assessment Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: {
    type: String,
    enum: ["PHQ9", "GAD7"]
  },
  answers: Number[],               // Array of scores per question (0-3)
  score: Number,                   // Calculated sum
  severity: String,                // None | Mild | Moderate | Severe
  interpretation: String,
  createdAt: Date                  // Timestamp for trend generation
}
```

#### F. DoctorAvailability Collection
```javascript
{
  _id: ObjectId,
  doctorId: ObjectId,              // Link to Doctor (User with role=doctor)
  day: String,                     // e.g. "Monday"
  startTime: String,               // e.g. "09:00"
  endTime: String,                 // e.g. "17:00"
  isAvailable: Boolean
}
```

---

## 3. UML Diagrams (Mermaid Format)

### 3.1 Use Case Diagram
Represented via `flowchart TD` to ensure universal rendering compatibility.

```mermaid
flowchart TD
    subgraph Actors
        Student([Student])
        Doctor([Doctor])
        Admin([Admin])
    end

    subgraph System ["Wellness & Consultation System"]
        UC_Auth["Register & Login"]
        UC_Journal["Log Journal Entry"]
        UC_Assess["Take Self-Assessment (PHQ-9/GAD-7)"]
        UC_Book["Book Appointment"]
        UC_DoctorAvailability["Manage Availability"]
        UC_Consult["Conduct Consultation"]
        UC_AdminAnalytics["View Analytics"]
        UC_AdminUsers["Manage Users & Verification"]
    end

    Student --> UC_Auth
    Student --> UC_Journal
    Student --> UC_Assess
    Student --> UC_Book

    Doctor --> UC_Auth
    Doctor --> UC_DoctorAvailability
    Doctor --> UC_Consult

    Admin --> UC_Auth
    Admin --> UC_AdminAnalytics
    Admin --> UC_AdminUsers
```

### 3.2 Entity-Relationship (ER) Diagram
Reflects relationships mapped to the 6 system collections.

```mermaid
erDiagram
    USER ||--o{ APPOINTMENT : "books/receives"
    USER ||--o{ JOURNAL : "writes"
    USER ||--o{ ASSESSMENT : "completes"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ DOCTOR_AVAILABILITY : "configures (if doctor)"

    USER {
        ObjectId id PK
        string role
        string email
        string passwordHash
        string firstName
        string lastName
        string phoneNumber
        string status
        boolean isEmailVerified
    }

    APPOINTMENT {
        ObjectId id PK
        ObjectId studentId FK
        ObjectId doctorId FK
        date scheduledDate
        string scheduledTime
        int duration
        string status
        string doctorNotes
    }

    NOTIFICATION {
        ObjectId id PK
        ObjectId userId FK
        string message
        boolean isRead
        string type
        date createdAt
    }

    JOURNAL {
        ObjectId id PK
        ObjectId userId FK
        string title
        string content
        string mood
        string visibility
        date createdAt
    }

    ASSESSMENT {
        ObjectId id PK
        ObjectId userId FK
        string type
        int score
        string severity
        date createdAt
    }

    DOCTOR_AVAILABILITY {
        ObjectId id PK
        ObjectId doctorId FK
        string day
        string startTime
        string endTime
        boolean isAvailable
    }
```

### 3.3 Class Diagram

```mermaid
classDiagram
    class User {
        +ObjectId id
        +string role
        +string email
        +string passwordHash
        +string firstName
        +string lastName
        +string phoneNumber
        +string status
        +boolean isEmailVerified
        +register()
        +login()
    }

    class Appointment {
        +ObjectId id
        +ObjectId studentId
        +ObjectId doctorId
        +date scheduledDate
        +string scheduledTime
        +int duration
        +string status
        +doctorNotes
        +confirm()
        +cancel()
    }

    class Notification {
        +ObjectId id
        +ObjectId userId
        +string message
        +boolean isRead
        +string type
        +date createdAt
        +markAsRead()
    }

    class Journal {
        +ObjectId id
        +ObjectId userId
        +string title
        +string content
        +string mood
        +string visibility
        +date createdAt
        +create()
        +update()
    }

    class Assessment {
        +ObjectId id
        +ObjectId userId
        +string type
        +int score
        +string severity
        +date createdAt
        +calculateScore()
        +getRecommendation()
    }

    class DoctorAvailability {
        +ObjectId id
        +ObjectId doctorId
        +string day
        +string startTime
        +string endTime
        +boolean isAvailable
        +updateAvailability()
    }

    User "1" --> "*" Appointment : participates
    User "1" --> "*" Notification : receives
    User "1" --> "*" Journal : owns
    User "1" --> "*" Assessment : completes
    User "1" --> "*" DoctorAvailability : configures
```

### 3.4 Sequence Diagram (Appointment Booking)
Incorporates database-driven notifications and api-based fetching.

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Frontend
    participant Backend
    participant MongoDB
    participant NotificationService

    Student->>Frontend: Select Doctor & Book Slot
    Frontend->>Backend: POST /api/appointments
    Note over Backend: Validate session & check availability
    Backend->>MongoDB: Insert Appointment (Status: scheduled)
    MongoDB-->>Backend: Appointment Saved (Success)
    
    Backend->>NotificationService: Trigger Booking Notification
    NotificationService->>MongoDB: Insert Notification (userId, message, isRead=false)
    MongoDB-->>NotificationService: Notification Logged
    NotificationService-->>Backend: Logged (Success)
    Backend-->>Frontend: 201 Created (Appointment Details)
    Frontend-->>Student: Display Booking Success Screen

    Note over Frontend, Backend: Later Check (Polling or Landing)
    Frontend->>Backend: GET /api/notifications
    Backend->>MongoDB: Query Notifications for Student
    MongoDB-->>Backend: Return List
    Backend-->>Frontend: 200 OK (Notification Array)
```

---

## 4. Consistent API Endpoints & System Mechanics

### 4.1 System API Specs

#### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

#### Journals
- `GET /api/journals`
- `POST /api/journals`
- `PUT /api/journals/:id`
- `DELETE /api/journals/:id`

#### Assessments
- `POST /api/assessments`
- `GET /api/assessments/history`

#### Availability
- `POST /api/availability`
- `GET /api/availability/:doctorId`

#### Appointments
- `POST /api/appointments`
- `GET /api/appointments`
- `PATCH /api/appointments/:id/cancel`

#### Notifications
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

#### Dashboard
- `GET /api/dashboard/student` -> returns:
  ```json
  {
    "journalCount": 12,
    "latestPHQ9": 8,
    "latestGAD7": 6,
    "upcomingAppointments": 2
  }
  ```
- `GET /api/dashboard/doctor` -> returns:
  ```json
  {
    "todayAppointments": 5,
    "totalStudents": 24
  }
  ```
- `GET /api/dashboard/admin` -> returns:
  ```json
  {
    "totalUsers": 250,
    "totalDoctors": 12,
    "totalAppointments": 380
  }
  ```

---

## 5. Standard Viva (Oral Examination) Questions & Answers

* **Q1: Why was PHQ-9 chosen for depression screening?**
  * **A:** PHQ-9 is a clinically validated, 9-question tool that measures depression severity based on diagnostic criteria. It is standardized, easy to implement in software, and yields actionable clinical insights.
* **Q2: Why was GAD-7 chosen for anxiety screening?**
  * **A:** GAD-7 is a standardized 7-question clinical questionnaire designed to screen for generalized anxiety disorder and determine severity (mild, moderate, or severe).
* **Q3: Why MongoDB instead of SQL databases like PostgreSQL?**
  * **A:** MongoDB supports document flexibility, allowing journals and assessments (which often have variant forms or schema changes) to be stored as simple, nested JSON files. It aligns seamlessly with Node.js/MERN stack development workflows.
* **Q4: How does stateless authentication work with JWT?**
  * **A:** The server verifies credentials, generates a signed JSON Web Token (JWT) with user roles, and sends it to the client. The client attaches this token in the `Authorization` header on API requests. The server verifies the token signature without database queries, ensuring high performance.
* **Q5: Why build the frontend using React?**
  * **A:** React utilizes a virtual DOM to ensure efficient rendering of components, promotes reusability, and provides a smooth, state-driven user experience for interactive dashboards.

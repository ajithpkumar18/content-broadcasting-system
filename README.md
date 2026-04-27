# Content Broadcasting System

A backend system where teachers upload subject-based content, principals approve or reject it, and students access live content through a public API. Content is dynamically scheduled and rotated per subject using time-based logic.

---

## Tech Stack

- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (Docker)
- **Auth**: JWT + bcrypt
- **File Uploads**: Multer (local storage)

---

## Project Structure

```
src/
├── controllers/     # Route handlers (auth, content, approval)
├── routes/          # Express routers
├── services/        # Business logic (scheduling, uploads, auth, approval)
├── middlewares/     # JWT verification, RBAC, file validation
├── utils/           # db.ts (Prisma client), jwt.ts, hash.ts
prisma/
├── schema.prisma    # DB schema (User, Content, ContentSlot, ContentSchedule)
├── migrations/      # Migration history
architecture-notes.txt  # System design decisions
```

---

## Setup Instructions

### 1. Clone and install

```bash
git clone <your-repo-url>
cd content-broadcasting-system
npm install
```

### 2. Configure environment

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your_secret_key
PORT=5000
```

### 3. Start the database

```bash
docker compose up -d
```

### 4. Run migrations

```bash
npx prisma migrate dev
```

### 5. Start the server

```bash
npm run dev
```

---

## Database Schema

### Users
Stores both principals and teachers.

| Field    | Type                  |
|----------|-----------------------|
| id       | UUID (PK)             |
| name     | String                |
| email    | String (unique)       |
| password | String (bcrypt hash)  |
| role     | PRINCIPAL / TEACHER   |
| createdAt| DateTime              |

### Content
Uploaded by teachers, approved/rejected by principal.

| Field          | Type                              |
|----------------|-----------------------------------|
| id             | UUID (PK)                         |
| title          | String                            |
| description    | String?                           |
| subject        | String                            |
| fileUrl        | String                            |
| fileType       | String                            |
| fileSize       | Int                               |
| status         | PENDING / APPROVED / REJECTED     |
| rejectionReason| String?                           |
| uploadedById   | FK → User                         |
| approvedById   | FK → User?                        |
| approvedAt     | DateTime?                         |
| startTime      | DateTime?                         |
| endTime        | DateTime?                         |
| createdAt      | DateTime                          |

### ContentSlot
One slot per subject — the broadcast channel for that subject.

| Field    | Type            |
|----------|-----------------|
| id       | UUID (PK)       |
| subject  | String (unique) |
| createdAt| DateTime        |

### ContentSchedule
Defines rotation order and duration for each content piece within a slot.

| Field        | Type              |
|--------------|-------------------|
| id           | UUID (PK)         |
| contentId    | FK → Content (unique) |
| slotId       | FK → ContentSlot  |
| rotationOrder| Int               |
| duration     | Int (minutes)     |
| createdAt    | DateTime          |

---

## API Reference

### Auth

#### Register
```
POST /api/auth/register
```
```json
{
  "name": "John",
  "email": "john@example.com",
  "password": "secret123",
  "role": "TEACHER"
}
```

#### Login
```
POST /api/auth/login
```
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```
Returns a JWT token. Include it in all protected routes:
```
Authorization: Bearer <token>
```

---

### Teacher Routes (JWT required, role: TEACHER)

#### Upload Content
```
POST /api/content/upload
Content-Type: multipart/form-data
```

| Field       | Required | Description                       |
|-------------|----------|-----------------------------------|
| file        | ✅       | JPG / PNG / GIF, max 10MB         |
| title       | ✅       | Content title                     |
| subject     | ✅       | e.g. Maths, Science               |
| startTime   | ✅       | ISO datetime (e.g. 2026-04-28T10:00:00Z) |
| endTime     | ✅       | ISO datetime                      |
| description | ❌       | Optional description              |
| duration    | ❌       | Minutes per rotation (default: 5) |

#### View My Uploads
```
GET /api/content/my-uploads
```
Returns all content uploaded by the authenticated teacher with current status.

---

### Principal Routes (JWT required, role: PRINCIPAL)

#### View All Content
```
GET /api/content/all
```

#### View Pending Content
```
GET /api/content/pending
```

#### Approve Content
```
POST /api/content/:id/approve
```

#### Reject Content
```
POST /api/content/:id/reject
```
```json
{
  "reason": "Low quality image"
}
```

---

### Public Routes (No auth required)

#### Get Live Content
```
GET /api/content/live/:teacherId
```
or
```
GET /api/public/live/:teacherId
```

Returns the currently active content per subject for that teacher.

**Success response:**
```json
{
  "Maths": {
    "id": "abc123",
    "title": "Chapter 3 Notes",
    "fileUrl": "/uploads/file.jpg",
    "subject": "Maths",
    "duration": 5,
    "rotationOrder": 1
  },
  "Science": {
    "id": "def456",
    "title": "Periodic Table",
    "fileUrl": "/uploads/file2.png",
    "subject": "Science",
    "duration": 5,
    "rotationOrder": 1
  }
}
```

**No content response (all edge cases):**
```json
{
  "message": "No content available"
}
```

---

## Scheduling Logic

Content rotation is computed dynamically on every request — no cron jobs or stored state required.

### How It Works

1. Fetch all `APPROVED` content for the teacher where `now` is between `startTime` and `endTime`
2. Group content by subject via `ContentSlot`
3. For each subject, sort by `rotationOrder` (ascending)
4. Calculate the active content using:

```
totalCycleMs = sum of all durations in the subject group (in ms)
epoch        = earliest startTime in the group
elapsedInCycle = (now - epoch) % totalCycleMs
```

Then walk the playlist to find which item owns `elapsedInCycle`.

### Example

```
Maths playlist (total cycle = 15 min):
  A (5 min) → B (5 min) → C (5 min) → loop

epoch = 12:00 PM, now = 12:22 PM
elapsed = 22 min
elapsedInCycle = 22 % 15 = 7 min
→ B is active (occupies the 5–10 min slot) ✓
```

---

## Content Lifecycle

```
Upload → PENDING → (Principal reviews) → APPROVED or REJECTED
                                               ↓
                                   Live only within startTime/endTime
                                   Rotates per subject schedule
```

---

## Edge Cases Handled

| Scenario | Response |
|----------|----------|
| No approved content for teacher | `"No content available"` |
| Content approved but outside time window | `"No content available"` |
| No `startTime` / `endTime` set | Content not shown |
| Invalid or unknown teacher ID | `"No content available"` |
| Subject with no active content | Subject omitted from response |

---

## Assumptions

- A teacher must set both `startTime` and `endTime` for content to ever go live
- `duration` defaults to 5 minutes if not provided at upload time
- File storage is local (`/uploads` directory)
- One `ContentSchedule` entry is created automatically per uploaded content
- `rotationOrder` is scoped per teacher + subject at the application layer

---

## Future Improvements

- Redis caching for `/live` endpoint (short TTL, invalidate on approve/reject)
- Rate limiting on public API (express-rate-limit)
- AWS S3 for file storage
- Pagination and subject/status/teacher filters
- Subject-wise analytics (most active subject, content usage tracking)

---

## Author

Ajith

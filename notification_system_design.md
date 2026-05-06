# Notification System Design

**Afford Medical Technologies Private Limited**
**Author:** Development Team
**Date:** 2026-05-06

---

# Stage 1

## REST API Design & Contract for Real-Time Notification Platform

### 1.1 Overview

This document defines the REST API contract for a real-time notification platform. The system allows authenticated users to receive, view, manage, and configure notifications. Real-time delivery is handled via WebSocket (Socket.IO), while the REST API serves as the source of truth for persistence and history.

---

### 1.2 Core Actions

The notification platform supports these core actions:

| # | Action | Description |
|---|--------|-------------|
| 1 | **List Notifications** | Retrieve paginated list of notifications for the authenticated user |
| 2 | **Get Notification** | Retrieve a single notification by ID |
| 3 | **Get Unread Count** | Retrieve the count of unread notifications |
| 4 | **Mark as Read** | Mark a single notification as read |
| 5 | **Mark All as Read** | Mark all notifications as read for the user |
| 6 | **Delete Notification** | Delete a single notification |
| 7 | **Create Notification** | Create and push a notification (admin/system use) |
| 8 | **Get Preferences** | Retrieve user notification preferences |
| 9 | **Update Preferences** | Update user notification preferences |

---

### 1.3 Base URL & Common Headers

**Base URL:** `http://localhost:5000/api/v1`

#### Common Request Headers

| Header | Value | Required | Description |
|--------|-------|----------|-------------|
| `Content-Type` | `application/json` | Yes | Request body format |
| `Authorization` | `Bearer <jwt_token>` | Yes | JWT authentication token |
| `X-Request-Id` | `<uuid>` | No | Unique request identifier for tracing |

#### Common Response Headers

| Header | Value | Description |
|--------|-------|-------------|
| `Content-Type` | `application/json` | Response body format |
| `X-Request-Id` | `<uuid>` | Echo of request ID or server-generated |
| `X-RateLimit-Remaining` | `<number>` | Remaining requests in window |

---

### 1.4 Standard Error Response Schema

All error responses follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Notification with id '663f...' not found",
    "status": 404
  }
}
```

**Error Codes:**

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `BAD_REQUEST` | Invalid request body or parameters |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT token |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `RESOURCE_NOT_FOUND` | Resource does not exist |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

### 1.5 REST API Endpoints

---

#### 1.5.1 List Notifications

Retrieve a paginated list of notifications for the authenticated user.

**Endpoint:** `GET /notifications`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max 100) |
| `read` | boolean | — | Filter by read status |
| `type` | string | — | Filter by notification type |
| `sortBy` | string | `createdAt` | Sort field |
| `order` | string | `desc` | Sort order (`asc` or `desc`) |

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "664a1b2c3d4e5f6789012345",
        "type": "info",
        "title": "Appointment Reminder",
        "message": "Your appointment with Dr. Smith is tomorrow at 10:00 AM",
        "read": false,
        "priority": "medium",
        "metadata": {
          "appointmentId": "apt-001",
          "doctorName": "Dr. Smith"
        },
        "actionUrl": "/appointments/apt-001",
        "createdAt": "2026-05-06T08:00:00.000Z",
        "updatedAt": "2026-05-06T08:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 95,
      "limit": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

#### 1.5.2 Get Single Notification

**Endpoint:** `GET /notifications/:id`

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "664a1b2c3d4e5f6789012345",
    "type": "alert",
    "title": "Lab Results Available",
    "message": "Your blood test results from May 3rd are now available for review.",
    "read": false,
    "priority": "high",
    "metadata": {
      "labOrderId": "lab-042",
      "testType": "Complete Blood Count"
    },
    "actionUrl": "/lab-results/lab-042",
    "createdAt": "2026-05-06T08:00:00.000Z",
    "updatedAt": "2026-05-06T08:00:00.000Z"
  }
}
```

---

#### 1.5.3 Get Unread Count

**Endpoint:** `GET /notifications/unread/count`

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "unreadCount": 12
  }
}
```

---

#### 1.5.4 Mark Notification as Read

**Endpoint:** `PATCH /notifications/:id/read`

**Request Body:** *(none required)*

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "664a1b2c3d4e5f6789012345",
    "read": true,
    "updatedAt": "2026-05-06T09:15:00.000Z"
  }
}
```

---

#### 1.5.5 Mark All Notifications as Read

**Endpoint:** `PATCH /notifications/read/all`

**Request Body:** *(none required)*

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "modifiedCount": 12,
    "message": "All notifications marked as read"
  }
}
```

---

#### 1.5.6 Delete Notification

**Endpoint:** `DELETE /notifications/:id`

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "message": "Notification deleted successfully"
  }
}
```

---

#### 1.5.7 Create Notification (Admin / System)

**Endpoint:** `POST /notifications`

**Request Body:**

```json
{
  "userId": "user-123",
  "type": "info",
  "title": "System Maintenance Scheduled",
  "message": "The platform will undergo maintenance on May 10th from 2:00 AM to 4:00 AM IST.",
  "priority": "high",
  "metadata": {
    "maintenanceWindow": "2026-05-10T02:00:00+05:30"
  },
  "actionUrl": "/announcements/maint-010"
}
```

**Field Definitions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | Target user ID |
| `type` | enum | Yes | One of: `info`, `alert`, `warning`, `success`, `system` |
| `title` | string | Yes | Notification title (max 200 chars) |
| `message` | string | Yes | Notification body (max 1000 chars) |
| `priority` | enum | No | `low`, `medium`, `high` (default: `medium`) |
| `metadata` | object | No | Arbitrary key-value data |
| `actionUrl` | string | No | Deep link URL |

**Response — `201 Created`:**

```json
{
  "success": true,
  "data": {
    "id": "664a1b2c3d4e5f6789012346",
    "userId": "user-123",
    "type": "info",
    "title": "System Maintenance Scheduled",
    "message": "The platform will undergo maintenance on May 10th from 2:00 AM to 4:00 AM IST.",
    "read": false,
    "priority": "high",
    "metadata": {
      "maintenanceWindow": "2026-05-10T02:00:00+05:30"
    },
    "actionUrl": "/announcements/maint-010",
    "createdAt": "2026-05-06T09:30:00.000Z",
    "updatedAt": "2026-05-06T09:30:00.000Z"
  }
}
```

---

#### 1.5.8 Get User Notification Preferences

**Endpoint:** `GET /preferences`

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "userId": "user-123",
    "emailNotifications": true,
    "pushNotifications": true,
    "mutedTypes": ["system"],
    "quietHours": {
      "enabled": true,
      "start": "22:00",
      "end": "07:00",
      "timezone": "Asia/Kolkata"
    },
    "updatedAt": "2026-05-01T10:00:00.000Z"
  }
}
```

---

#### 1.5.9 Update User Notification Preferences

**Endpoint:** `PUT /preferences`

**Request Body:**

```json
{
  "emailNotifications": false,
  "pushNotifications": true,
  "mutedTypes": ["system", "info"],
  "quietHours": {
    "enabled": true,
    "start": "23:00",
    "end": "06:00",
    "timezone": "Asia/Kolkata"
  }
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "userId": "user-123",
    "emailNotifications": false,
    "pushNotifications": true,
    "mutedTypes": ["system", "info"],
    "quietHours": {
      "enabled": true,
      "start": "23:00",
      "end": "06:00",
      "timezone": "Asia/Kolkata"
    },
    "updatedAt": "2026-05-06T09:45:00.000Z"
  }
}
```

---

### 1.6 Real-Time Notification Delivery Mechanism

REST APIs are pull-based and cannot push data to the client in real-time. To solve this, we use **WebSocket** connections via the **Socket.IO** library.

#### Architecture

```
┌────────────┐       HTTP REST        ┌───────────────┐       MongoDB
│   React    │ ◄──────────────────►   │  Express.js   │ ◄──────────────►  DB
│  Frontend  │                        │   Backend     │
│            │ ◄══════════════════►   │               │
└────────────┘    WebSocket (WS)      └───────────────┘
                  (Socket.IO)
```

#### Socket.IO Events

**Server → Client (Emitted by Server):**

| Event Name | Payload | Description |
|------------|---------|-------------|
| `notification:new` | `{ id, type, title, message, priority, createdAt }` | New notification pushed to the user |
| `notification:read` | `{ id }` | Confirmation that a notification was marked read |
| `notification:readAll` | `{ modifiedCount }` | Confirmation that all were marked read |
| `notification:deleted` | `{ id }` | Confirmation that a notification was deleted |

**Client → Server (Emitted by Client):**

| Event Name | Payload | Description |
|------------|---------|-------------|
| `authenticate` | `{ token }` | Client sends JWT after connection for room assignment |

#### Connection Flow

1. Client connects to WebSocket server at `ws://localhost:5000`
2. Client emits `authenticate` event with JWT token
3. Server verifies the token, extracts `userId`, and joins the socket to a room named `user:<userId>`
4. When a new notification is created (via REST API), the server emits `notification:new` to the user's room
5. Client updates UI state instantly without polling

---

# Stage 2

## Database Design, Scaling Strategy & Queries

### 2.1 Database Choice: MongoDB

**We recommend MongoDB** (NoSQL document database) for the following reasons:

| Factor | Why MongoDB Fits |
|--------|-----------------|
| **Flexible Schema** | Notification types vary — some have appointment metadata, some have lab results, some are plain text. MongoDB's schemaless documents handle the `metadata` field naturally without ALTER TABLE operations. |
| **Write-Heavy Workload** | Notification systems generate far more writes than reads. MongoDB's append-oriented storage engine handles high write throughput efficiently. |
| **Time-Series Pattern** | Notifications are chronologically ordered and often accessed by recency — MongoDB excels at this with compound indexes on `(userId, createdAt)`. |
| **Horizontal Scaling** | MongoDB supports native sharding. As data grows, we can shard by `userId` to distribute load across multiple servers. |
| **TTL Indexes** | MongoDB supports automatic document expiration via TTL indexes — ideal for auto-deleting old notifications without cron jobs. |
| **Rich Query Language** | Supports the filtering, sorting, and pagination required by our REST API with a single query language. |

---

### 2.2 Database Schema

#### Notification Collection

```javascript
// Collection: notifications
{
  _id: ObjectId("664a1b2c3d4e5f6789012345"),
  userId: "user-123",                          // String - target user
  type: "info",                                // Enum: info | alert | warning | success | system
  title: "Appointment Reminder",               // String - max 200 chars
  message: "Your appointment is tomorrow...",   // String - max 1000 chars
  read: false,                                 // Boolean - read status
  priority: "medium",                          // Enum: low | medium | high
  metadata: {                                  // Object - flexible extra data
    appointmentId: "apt-001",
    doctorName: "Dr. Smith"
  },
  actionUrl: "/appointments/apt-001",          // String - deep link
  createdAt: ISODate("2026-05-06T08:00:00Z"),  // Date - auto-set
  updatedAt: ISODate("2026-05-06T08:00:00Z"),  // Date - auto-updated
  expiresAt: ISODate("2026-08-06T08:00:00Z")   // Date - TTL expiry (90 days)
}
```

**Indexes:**

```javascript
// Primary query index — list notifications for a user sorted by date
db.notifications.createIndex({ userId: 1, createdAt: -1 })

// Unread count index — fast count of unread per user
db.notifications.createIndex({ userId: 1, read: 1 })

// Type filter index — filter by notification type
db.notifications.createIndex({ userId: 1, type: 1, createdAt: -1 })

// TTL index — auto-delete documents 90 days after expiresAt
db.notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

#### User Preferences Collection

```javascript
// Collection: user_preferences
{
  _id: ObjectId("664b2c3d4e5f678901234567"),
  userId: "user-123",                           // String - unique per user
  emailNotifications: true,                     // Boolean
  pushNotifications: true,                      // Boolean
  mutedTypes: ["system"],                       // Array of type strings
  quietHours: {
    enabled: true,
    start: "22:00",                             // String - HH:mm format
    end: "07:00",
    timezone: "Asia/Kolkata"
  },
  createdAt: ISODate("2026-05-01T10:00:00Z"),
  updatedAt: ISODate("2026-05-01T10:00:00Z")
}
```

**Indexes:**

```javascript
// Unique index on userId for fast lookup
db.user_preferences.createIndex({ userId: 1 }, { unique: true })
```

---

### 2.3 Problems with Increasing Data Volume

As the notification system scales, the following problems will arise:

#### Problem 1: Unbounded Collection Growth

**Issue:** Each user generates dozens of notifications daily. With 100K users, this means millions of documents per month. Storage costs and query latency increase linearly.

**Solution:**
- **TTL Indexes** — Set `expiresAt` to automatically delete notifications older than 90 days. MongoDB's background thread removes expired documents without application code.
- **Archiving** — Move notifications older than 30 days to a cold storage collection (`notifications_archive`) or an object store (S3) for compliance, then delete from the hot collection.

```javascript
// TTL index auto-deletes expired documents
db.notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

#### Problem 2: Query Performance Degradation

**Issue:** As the collection grows to billions of documents, even indexed queries slow down because index sizes exceed available RAM.

**Solution:**
- **Compound Indexes** — Ensure queries always hit covered indexes. The `{ userId: 1, createdAt: -1 }` compound index ensures user-scoped queries never scan the entire collection.
- **Projection** — Only return needed fields to reduce document transfer size.
- **Cursor-Based Pagination** — Replace offset-based pagination (`skip/limit`) with cursor-based pagination using `createdAt` as the cursor to avoid the O(n) skip cost.

```javascript
// Cursor-based pagination (much faster than skip at high offsets)
db.notifications.find({
  userId: "user-123",
  createdAt: { $lt: ISODate("2026-05-05T00:00:00Z") }  // cursor
}).sort({ createdAt: -1 }).limit(20)
```

#### Problem 3: Write Throughput Bottleneck

**Issue:** A single MongoDB replica set has write limits (~50K writes/sec). At massive scale, writes become a bottleneck.

**Solution:**
- **Sharding** — Shard the `notifications` collection by `userId` (hashed shard key). This distributes writes and reads evenly across shards.
- **Write Concern Tuning** — Use `w: 1` (acknowledge after primary write) for notifications since eventual consistency is acceptable.

```javascript
// Enable sharding
sh.shardCollection("notificationDB.notifications", { userId: "hashed" })
```

#### Problem 4: Hot User Problem

**Issue:** Some users (e.g., admins) receive disproportionately more notifications, creating hotspots on a single shard.

**Solution:**
- **Hashed Shard Key** — Using `{ userId: "hashed" }` distributes documents evenly regardless of userId distribution.
- **Per-User Rate Limiting** — Cap the number of notifications per user per hour to prevent abuse.

---

### 2.4 MongoDB Queries for Each REST API Endpoint

Below are the exact MongoDB queries mapped to each REST API endpoint from Stage 1.

#### Query 1: List Notifications — `GET /notifications`

```javascript
// With filters: read=false, type=alert, page=2, limit=20, sortBy=createdAt, order=desc
db.notifications.find({
  userId: "user-123",
  read: false,
  type: "alert"
})
.sort({ createdAt: -1 })
.skip(20)             // (page - 1) * limit
.limit(20)

// Total count for pagination
db.notifications.countDocuments({
  userId: "user-123",
  read: false,
  type: "alert"
})
```

#### Query 2: Get Single Notification — `GET /notifications/:id`

```javascript
db.notifications.findOne({
  _id: ObjectId("664a1b2c3d4e5f6789012345"),
  userId: "user-123"   // ensure user owns this notification
})
```

#### Query 3: Get Unread Count — `GET /notifications/unread/count`

```javascript
db.notifications.countDocuments({
  userId: "user-123",
  read: false
})
```

#### Query 4: Mark as Read — `PATCH /notifications/:id/read`

```javascript
db.notifications.findOneAndUpdate(
  {
    _id: ObjectId("664a1b2c3d4e5f6789012345"),
    userId: "user-123"
  },
  {
    $set: { read: true, updatedAt: new Date() }
  },
  { returnDocument: "after" }
)
```

#### Query 5: Mark All as Read — `PATCH /notifications/read/all`

```javascript
db.notifications.updateMany(
  {
    userId: "user-123",
    read: false
  },
  {
    $set: { read: true, updatedAt: new Date() }
  }
)
// Returns { modifiedCount: 12 }
```

#### Query 6: Delete Notification — `DELETE /notifications/:id`

```javascript
db.notifications.findOneAndDelete({
  _id: ObjectId("664a1b2c3d4e5f6789012345"),
  userId: "user-123"
})
```

#### Query 7: Create Notification — `POST /notifications`

```javascript
db.notifications.insertOne({
  userId: "user-123",
  type: "info",
  title: "System Maintenance Scheduled",
  message: "The platform will undergo maintenance...",
  read: false,
  priority: "high",
  metadata: { maintenanceWindow: "2026-05-10T02:00:00+05:30" },
  actionUrl: "/announcements/maint-010",
  createdAt: new Date(),
  updatedAt: new Date(),
  expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)  // 90 days TTL
})
```

#### Query 8: Get Preferences — `GET /preferences`

```javascript
db.user_preferences.findOne({
  userId: "user-123"
})
```

#### Query 9: Update Preferences — `PUT /preferences`

```javascript
db.user_preferences.findOneAndUpdate(
  { userId: "user-123" },
  {
    $set: {
      emailNotifications: false,
      pushNotifications: true,
      mutedTypes: ["system", "info"],
      quietHours: {
        enabled: true,
        start: "23:00",
        end: "06:00",
        timezone: "Asia/Kolkata"
      },
      updatedAt: new Date()
    },
    $setOnInsert: {
      userId: "user-123",
      createdAt: new Date()
    }
  },
  { upsert: true, returnDocument: "after" }
)
```

---

### 2.5 Summary

| Aspect | Decision |
|--------|----------|
| **Database** | MongoDB (document store) |
| **Primary Index** | `{ userId: 1, createdAt: -1 }` compound index |
| **Auto-Cleanup** | TTL index on `expiresAt` (90-day expiry) |
| **Scaling Strategy** | Hashed sharding on `userId` |
| **Pagination** | Cursor-based for performance at scale |
| **Archiving** | Move old docs to `notifications_archive` collection |

---

# Stage 3

## Database Query Optimization

**The Problematic Query:**
```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

**Why is this query slow?**
1. **Missing Compound Index:** Without an index covering `(studentID, isRead, createdAt)`, the database must perform a full table scan or sort the results in memory (filesort), which is extremely slow for 5,000,000 rows.
2. **`SELECT *`:** Fetching all columns (including large message payloads or metadata) consumes excess network bandwidth and memory, preventing the use of index-only scans (covering indexes).

**Proposed Solution:**
Create a composite index on the exact fields used in filtering and sorting.
```sql
CREATE INDEX idx_student_unread_date ON notifications (studentID, isRead, createdAt);
```
Change the query to only fetch necessary columns (e.g., `id`, `message`, `type`, `createdAt`).

**Computation Cost:**
With the index, the database can instantly jump to `studentID = 1042`, filter `isRead = false`, and traverse the B-Tree in order of `createdAt`. The time complexity reduces from `O(N)` (table scan) or `O(N log N)` (filesort) to roughly `O(log N + K)` where `K` is the number of unread notifications for that specific student.

**Adding Indexes on Every Column?**
*Is this advice effective?* **No, it is highly detrimental.**
*Why?* Every index must be updated synchronously on `INSERT`, `UPDATE`, and `DELETE`. Adding indexes to every column will drastically slow down write performance (a critical metric for a notification system) and massively inflate the storage space (index bloat) with no query benefit, as databases typically use only one index per table in a query execution plan.

**Query: Students with a Placement notification in the last 7 days**
```sql
SELECT DISTINCT studentID 
FROM notifications
WHERE notificationType = 'Placement' 
  AND createdAt >= NOW() - INTERVAL 7 DAY;
```
*(Assumes `notificationType` is an ENUM and an index on `(notificationType, createdAt, studentID)` exists for optimal performance).*

---

# Stage 4

## Performance Under High Load (Fetching on Page Load)

**The Problem:**
Fetching notifications synchronously via the DB on every single page load overwhelms the database. This pattern causes O(Active Users * Page Loads) database queries.

**Suggested Solutions & Tradeoffs:**

### 1. In-Memory Caching (Redis/Memcached)
Cache the unread count and latest notifications for each user in Redis. Read from Redis on page load.
- **Tradeoff:** Increases architectural complexity. You must invalidate or update the cache every time a new notification is generated or read (Cache Invalidation).

### 2. Push vs. Pull (WebSockets / SSE)
Instead of the client requesting data on page load, establish a persistent WebSocket (or Server-Sent Events) connection. Send the unread count and notifications once on connection, then only push updates when they occur.
- **Tradeoff:** Maintaining thousands of active WebSocket connections consumes server memory and requires connection management (heartbeats, reconnection logic, load balancing).

### 3. Client-Side Caching & Debouncing
Cache the notification payload in the browser (e.g., `localStorage` or `sessionStorage` or React Context). Only hit the API if the cached data is stale (e.g., older than 30 seconds).
- **Tradeoff:** Data may be slightly stale (eventual consistency). A user might see an unread badge for a few seconds after reading it on another device.

**Best Approach:**
A hybrid approach: Fetch the initial state from a Redis cache on login/app load, and then use WebSockets (as implemented in Stage 1) to push delta updates. This entirely removes the DB read-load from typical page navigation.

---

# Stage 5

## Reliable Delivery Refactoring

**Original Pseudocode:**
```python
function notify_all(student_ids: array, message: string):
    for student_id in student_ids:
        send_email(student_id, message) # calls Email API
        save_to_db(student_id, message) # DB insert
        push_to_app(student_id, message) # real time mechanism
```

**Shortcomings:**
1. **Synchronous & Blocking:** Doing external HTTP calls (`send_email`) inside a loop for 50,000 students will take hours. If one request hangs, the entire thread blocks.
2. **Partial Failures & No Retries:** If it fails at student 20,000, there is no state tracking. You cannot safely retry without risking duplicate emails to the first 19,999 students.
3. **Coupling:** Database saves and external emails shouldn't be rigidly tied in the same transaction loop.

**Should saving to DB and sending email happen together?**
**No.** Saving to a DB is typically fast and reliable (internal network). Calling a third-party Email API (e.g., SendGrid) is slow, rate-limited, and prone to network timeouts. Tying them together risks failing a local DB transaction because a remote server timed out. They should be decoupled using an asynchronous message queue.

**Redesign & Revised Pseudocode:**
We will use a Producer-Consumer pattern. The API call simply drops jobs into a robust message queue (e.g., RabbitMQ, Apache Kafka, AWS SQS) and returns immediately. Worker services process the queues asynchronously with built-in retry mechanisms and dead-letter queues (DLQ) for permanent failures.

```python
# PRODUCER (API Endpoint)
function notify_all(student_ids: array, message: string):
    # Fast: Bulk insert into DB first (source of truth)
    bulk_save_to_db(student_ids, message)
    
    # Fast: Publish payload to a message queue for async processing
    event_payload = { "student_ids": student_ids, "message": message }
    MessageQueue.publish("topic_email_notifications", event_payload)
    MessageQueue.publish("topic_push_notifications", event_payload)
    
    return "Notifications queued successfully"

# CONSUMER 1 (Email Worker) - Scales horizontally
function consume_email_queue(job):
    # Process in batches or individually
    for student_id in job.student_ids:
        try:
            send_email(student_id, job.message)
        except EmailAPIError:
            # Re-queue specific student for retry with exponential backoff
            MessageQueue.retry_later("topic_email_notifications", student_id, job.message)

# CONSUMER 2 (Push Worker)
function consume_push_queue(job):
    for student_id in job.student_ids:
        try:
            push_to_app(student_id, job.message)
        except PushError:
            MessageQueue.retry_later("topic_push_notifications", student_id, job.message)
```

---

# Stage 6

## Priority Inbox

**Approach:**
To determine the top 'n' most important unread notifications, we apply a heuristic scoring function that considers both the `Type` and the `Timestamp`.
- **Weight Factor:** Placement = 300, Result = 200, Event = 100.
- **Recency Factor:** We convert the `Timestamp` to an epoch timestamp and scale it down so it acts as a tie-breaker or amplifier within the weight bounds.
- **Sorting:** We sum the `Weight` and `Recency` scores to produce a `PriorityScore`. The array is sorted descending by this score.

The script `priority_inbox.js` implements this logic. It fetches data from the evaluation service API, computes scores, sorts them, and displays the top 10 items.

**Handling New Incoming Notifications Efficiently:**
If maintaining the top 10 efficiently on the backend in real-time, we would use a **Priority Queue (Min-Heap)** of size 10, or a **Redis Sorted Set (`ZSET`)**.
1. **Redis ZSET:** Store notifications with the `PriorityScore` as the score. `ZREVRANGEBYSCORE` fetches the top 10 in `O(log N)` time.
2. **Min-Heap (In-Memory):** Maintain a heap of size 10. When a new notification arrives, compare its score to the minimum score in the heap (the root). If it's higher, extract the min and insert the new item (`O(log k)` complexity where `k=10`).

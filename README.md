# Real-Time Notification Platform

This repository contains the complete implementation and architectural design for the **Real-Time Notification System**, built for the Afford Medical Technologies placement evaluation.

## Project Structure

The project is broken down into modular components reflecting the 7 stages of the assignment:

### 1. Architectural Design & Theory (Stages 1-5)
**File:** [`notification_system_design.md`](./notification_system_design.md)
Contains comprehensive documentation addressing:
*   **Stage 1:** REST API Design and JSON Contracts.
*   **Stage 2:** Database Design (MongoDB), indexing strategies, and scaling architectures for millions of notifications.
*   **Stage 3:** SQL Query Optimization (Replacing `SELECT *` with covered composite indexes).
*   **Stage 4:** Performance tuning for high-load systems (Redis caching & WebSockets vs. Fetch on load).
*   **Stage 5:** Decoupling synchronous DB saves and external Email APIs using a Producer-Consumer Message Queue architecture.

### 2. Priority Inbox Logic (Stage 6)
**File:** [`priority_inbox.js`](./priority_inbox.js)
A standalone Node.js script that fetches live data from the remote Evaluation Service API and calculates a `priorityScore` to surface the **Top 10** most critical notifications.
*   **Algorithm:** Uses a heuristic scoring engine combining Base Weights (`Placement = 300`, `Result = 200`, `Event = 100`) with a highly granular recency factor (derived from Epoch timestamps).
*   **Execution:** `node priority_inbox.js`

### 3. Premium Frontend UI (Stage 7)
**Folder:** [`stage7_frontend/`](./stage7_frontend)
A highly polished, visually stunning web interface built with **React**, **Vite**, and **Material UI**.
*   **Features:** Displays "All Notifications" with pagination and category filtering, alongside a dedicated "Priority Inbox" tab powered by the Stage 6 heuristic engine.
*   **Aesthetics:** Implements a premium sleek dark mode, glassmorphism paneling, animated gradient headers, micro-animations on hover, and custom type-specific gradient avatars. 
*   **Execution:** `npm run dev`

### 4. Logging Middleware (Pre-Requisite)
**Folder:** [`logging_middleware/`](./logging_middleware)
A robust custom logging utility that securely transmits application logs to the remote `evaluation-service/logs` endpoint. It includes logic to seamlessly strip JWT formatting artifacts (quotes) and automatically intercepts Express backend responses.

### 5. Backend Server
**Folder:** [`notification_app_be/`](./notification_app_be)
An Express/MongoDB backend implementation demonstrating real-time WebSockets setup, REST API route structure, and the integration of the Logging Middleware.

---

## Setup & Running

**Prerequisites:** Node.js (v18+) and MongoDB.
Make sure to add your fresh API token into the respective `.env` files before running.

**Run Frontend:**
```bash
cd stage7_frontend
npm install
npm run dev
```

**Test Priority Script:**
```bash
node priority_inbox.js
```

## Results & Validation
Visual proof of functionality, including UI states, filters, and priority queues, can be found in the [`RESULTS/`](./RESULTS) directory.

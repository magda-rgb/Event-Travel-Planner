# Event Travel Planner

**Event Travel Planner** is a web application developed as part of a **bachelor’s thesis project**, aiming to combine **event management** with **travel planning** into a single, integrated platform.

The application allows users to browse various events (concerts, conferences, festivals, etc.). In later stages of development, it will automatically suggest **transportation** and **accommodation** options tailored to the selected event and user preferences.

The project is currently in its **first development stage**, focused on building the system architecture, frontend–backend communication, and user management.

## Table of Contents
- **[Getting Started](#getting-started)**
- **[Installing](#installing)**
- **[Overview](#overview)**
- **[Back-end](#back-end)**
- **[API Endpoints](#api-endpoints)**
  - **[Auth & User Endpoints](#auth--user-endpoints)**
  - **[Event Endpoints](#event-endpoints)**
  - **[Register Endpoint](#register-endpoint)**
  - **[Login Endpoint](#login-endpoint)**
  - **[Current User Endpoint](#current-user-endpoint)**
  - **[Update User Endpoint](#update-user-endpoint)**
  - **[Delete User Endpoint](#delete-user-endpoint)**

## Getting Started
The app is in its first development stage, focusing on architecture, frontend–backend communication, and user management. Future releases will include transport and accommodation suggestions to unify trip logistics for event attendees.

## Installing
### Requirements
- Python 3.13+
- Node.js (LTS recommended)

### Backend
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install "fastapi[standard]"
fastapi dev main.py       # or: uvicorn main:app --reload
```

Backend API: http://localhost:8000

### Frontend
```bash
cd front
npm install
npm start
```

Frontend: http://localhost:3000

## Overview
- Browse and search events; view event details.
- User registration and OAuth2 password login.
- User profile read/update/delete.
- Frontend–backend communication over REST.
- Data stored in JSON files (`users.json`, `events.json`) for now; target is a relational DB.
- Planned: advanced auth/authorization, external transport/hotel integrations, recommendations, user dashboard.

## Back-end
- **Stack:** FastAPI + Uvicorn (Python 3.13)
- **Auth:** OAuth2 password flow issuing bearer tokens
- **Data:** JSON persistence (`users.json`, `events.json`)
- **CORS:** Frontend allowed from `http://localhost:3000`

## API Endpoints
Base URL: `http://localhost:8000`

### Auth & User Endpoints

| Method | Route | Auth | Body | Response |
| --- | --- | --- | --- | --- |
| POST | `/register` | none | JSON: `username`, `password`, `fullname`, `email` | `{ "status": "User registered successfully", "user_id": "<id>" }` |
| POST | `/token` | none | Form: `username`, `password` | `{ "access_token": "<user_id>", "token_type": "bearer" }` (use as Bearer token) |
| GET | `/user` | Bearer token | — | User profile without `hashed_password` |
| PUT | `/update_user` | Bearer token | JSON (optional): `username`, `password`, `fullname`, `email` | `{ "status": "User updated successfully" }` |
| DELETE | `/delete_user` | Bearer token | JSON: `password` (current) | `{ "status": "User deleted successfully" }` |

### Event Endpoints

| Method | Route | Auth | Query/Body | Response |
| --- | --- | --- | --- | --- |
| GET | `/events` | none | — | JSON object keyed by event id |
| GET | `/events/search` | none | Query: `q` (search term) | Filtered JSON object keyed by event id |
| GET | `/event` | none | Query: `q` (event id) | Single event object or 404 |


# Examples
### Register Endpoint
- **Method:** POST
- **Route:** `/register`
- **Body (JSON):** `{ "username": "...", "password": "...", "fullname": "...", "email": "..." }`
- **Response:** `{ "status": "User registered successfully", "user_id": "<id>" }`
- **Notes:** Rejects duplicate usernames.

### Login Endpoint
- **Method:** POST
- **Route:** `/token`
- **Body (form):** `username=<user>&password=<pass>`
- **Response:** `{ "access_token": "<user_id>", "token_type": "bearer" }`
- **Notes:** Use the returned `access_token` as `Authorization: Bearer <token>`.

### Current User Endpoint
- **Method:** GET
- **Route:** `/user`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** User profile without `hashed_password`.

### Update User Endpoint
- **Method:** PUT
- **Route:** `/update_user`
- **Headers:** `Authorization: Bearer <token>`
- **Body (JSON, optional fields):** `{ "username": "...", "password": "...", "fullname": "...", "email": "..." }`
- **Response:** `{ "status": "User updated successfully" }`

### Delete User Endpoint
- **Method:** DELETE
- **Route:** `/delete_user`
- **Headers:** `Authorization: Bearer <token>`
- **Body (JSON):** `{ "password": "<current_password>" }`
- **Response:** `{ "status": "User deleted successfully" }`

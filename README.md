# Event Travel Planner

---

**Event Travel Planner** is a web application developed as part of a **bachelor’s thesis project**, aiming to combine **event management** with **travel planning** into a single, integrated platform.

The application allows users to browse various events (concerts, conferences, festivals, etc.). In later stages of development, it will automatically suggest **transportation** and **accommodation** options tailored to the selected event and user preferences.

The project is currently in its **first development stage**, focused on building the system architecture, frontend–backend communication, and user management.

---

## 🎯 Project Goal

The main objective of the application is to create a system that:

1. Allows users to browse and search for cultural and business events  
2. Enables users to select a specific event  
3. In future stages, automatically suggests:
   - **transportation options**
   - **accommodation options**

based on the event’s location, date, and user preferences.

This approach eliminates the need to use multiple separate services — all logistics related to attending an event are handled in one place.

---

## ⚙️ Features

Currently, the application provides:

- user registration and authentication
- browsing and searching for events
- detailed view of a single event
- basic CRUD operations
- frontend–backend communication via API
- temporary data storage using JSON files

Planned features:

- advanced user authentication and authorization
- integration with external APIs (transportation, accommodation)
- recommendation system based on user preferences
- user dashboard

---

## 🧩 Project Architecture

The project consists of two main parts:

### Frontend
- web application built with **React.js**
- user interface
- login and registration forms
- communication with the backend via REST API

### Backend
- API server built with **FastAPI**
- user and event management
- business logic layer
- temporary data layer based on JSON files  
  *(target solution: relational database)*

---

## 🛠️ Technologies

### Frontend
- React.js
- JavaScript (ES6+)
- HTML5 / CSS3

### Backend
- Python 3.13
- FastAPI
- Uvicorn

---

## 🚀 Running the Project Locally

This repository contains a simple Events application back-end API built with FastAPI.
The API supports:

- user registration + login (OAuth2 password flow)
- getting and updating the current user
- deleting user account
- listing events, searching events, and fetching a single event

Data persistence is handled via local JSON files:
- users.json
- events.json

## Installing
A step by step series of examples that tell you how to get a development environment running
`cd` into `server` folder and install dependencies with:

Go to the backend folder and install dependencies:

```
yarn or npm install
```

Then launch the api with: 

```
yarn or npm run server
```
# Overview
- Creating campaigns and seeing predictions for how successful they will be.

# Back-end 

API's | RDBMS and Data Persistence | Authentication | Form Testing


# API Endpoints
Use Base URL: http://localhost:8000


Register & Login 
| Method | Route                  | Description                                      |
|--------|------------------------|--------------------------------------------------|
| POST   | /api//register         | registers new users                              |
| POST   | /api/token             | logs user into account                           |
| GET    | /api/user              | returns current logged in user                   |

Users
| Method | Route                  | Description                                      |
|--------|------------------------|--------------------------------------------------|
| PUT    | /update_user           | updates current logged in user                   |
| DELETE | /delete_user           | deletes current logged in user                   |

Events
| Method | Route                  | Description                                      |
|--------|------------------------|--------------------------------------------------|
| GET   | /api/events             | registers new users                              |
| GET   | /api/events/search      | returns filtered events by query                 |
| GET    | /api/events            | returns one event by key                         |

## Register Endpoint
```js
POST /api/auth/register
```
Expected Body 
```js
    {
    "username": "test",
    "fullname": "test",
    "email": "test@test.pl",
    "disabled": false,
    "hashed_password": "hashtest"
  }
```

Expected Response
```js
   "1":{
    "username": "new_username",
    "fullname": "fullname",
    "email": "email@example.com",
    "hashed_password": "hashpassword",
    "disabled": "False"
  }
```
## Login Endpoint
```js
POST /api/auth/login
```
Expected Body
```js
{
    "username": "test_user",
    "password": "password"
}
```
Expected Response
```js
{
    "message": "Welcome test_user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoxMiwidXNlcm5hbWUiOiJuZXdfdXNlcjEyMTIxMiIsImlhdCI6MTU5ODQyMDg0NywiZXhwIjoxNTk4NDI4MDQ3fQ.YyR_rrRxYaDVTt3FPM155hPwbUAEFhyaDSOWqVOD8kM"
}
```
### DELETE campaign by ID
```js
DELETE /api/campaigns/:id

Expected Response: deletes campaign specified by :id

Expected Response: 
    {
        "deleted": 1
    }
```




-----------

### Backend
```bash
cd backend
python -m venv venv
source .venv/Scripts/activate
((.vene))
pip install -r requirements.txt
fastapi dev main.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

Frontend available at:
http://localhost:3000

Backend API available at:
http://localhost:8000

## 🧪 Academic Context

The project serves a dual purpose:
- as a practical web application,
- as a research and development platform created as part of a bachelor’s thesis.
The system architecture has been designed in a modular and extensible way, allowing for further development, algorithm testing, and integration of new services in subsequent stages of the project.

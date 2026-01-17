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
- Python 3.10+
- FastAPI
- Uvicorn

---

## 🚀 Running the Project Locally

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
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

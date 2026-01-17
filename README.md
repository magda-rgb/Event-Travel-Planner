# Event Travel Planner

---

**Event Travel Planner** to aplikacja webowa tworzona w ramach **pracy licencjackiej**, której celem jest połączenie **zarządzania wydarzeniami** z **planowaniem podróży** w jednym, spójnym systemie.

Aplikacja umożliwia użytkownikom przeglądanie wydarzeń (koncertów, konferencji, festiwali itp.), a w kolejnych etapach rozwoju będzie automatycznie proponować **transport** oraz **noclegi** dopasowane do wybranego wydarzenia i preferencji użytkownika.

Projekt znajduje się obecnie w **pierwszej fazie rozwoju**, skoncentrowanej na architekturze systemu, komunikacji frontend–backend oraz obsłudze użytkowników.

---

## 🎯 Cel projektu

Głównym celem aplikacji jest stworzenie systemu, który:

1. Umożliwia przeglądanie i wyszukiwanie wydarzeń kulturalnych i biznesowych  
2. Pozwala użytkownikowi wybrać konkretne wydarzenie  
3. W przyszłości automatycznie sugeruje:
   - **opcje transportu**
   - **opcje noclegowe**

na podstawie lokalizacji wydarzenia, daty oraz preferencji użytkownika.

Dzięki temu użytkownik nie musi korzystać z wielu oddzielnych serwisów — cała logistyka związana z udziałem w wydarzeniu jest obsługiwana w jednym miejscu.

---

## ⚙️ Funkcjonalności

Aktualnie aplikacja oferuje:

- rejestrację i logowanie użytkowników
- przeglądanie oraz wyszukiwanie wydarzeń
- widok szczegółów pojedynczego wydarzenia
- podstawowe operacje CRUD
- komunikację frontend–backend przez API
- tymczasowe przechowywanie danych w plikach JSON

Planowane funkcjonalności:

- zaawansowana autentykacja i autoryzacja użytkowników
- integracja z zewnętrznymi API (transport, noclegi)
- system rekomendacji oparty o preferencje użytkownika
- panel użytkownika

---

## 🧩 Architektura projektu

Projekt składa się z dwóch głównych części:

### Frontend
- aplikacja webowa napisana w **React.js**
- interfejs użytkownika
- formularze logowania i rejestracji
- komunikacja z backendem przez REST API

### Backend
- serwer API oparty o **FastAPI**
- obsługa użytkowników i wydarzeń
- logika biznesowa aplikacji
- tymczasowa warstwa danych oparta o pliki JSON  
  *(docelowo: relacyjna baza danych)*

---

## 🛠️ Technologie

### Frontend
- React.js
- JavaScript 
- HTML5 / CSS3
- tailwind

### Backend
- Python 3.10+
- FastAPI
  

---

## 🚀 Uruchomienie projektu lokalnie

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

Frontend dostępny pod adresem:
http://localhost:3000

Backend API dostępne pod adresem:
http://localhost:8000

## 🧪 Kontekst akademicki

Projekt pełni podwójną rolę:
- praktycznej aplikacji webowej,
- platformy badawczo-rozwojowej w ramach pracy licencjackiej,
- Architektura systemu została zaprojektowana w sposób modularny i rozszerzalny, co umożliwia dalszy rozwój, testowanie algorytmów oraz integrację nowych usług w kolejnych etapach pracy.

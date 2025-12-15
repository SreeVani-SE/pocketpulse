# PocketPulse

PocketPulse is a full-stack personal finance tracking application that allows users to securely log in with Google, track income and expenses, filter transactions, and view currency conversions using an external exchange-rate API.

---

##  Live Links

- **Frontend (GitHub Pages):** https://sreevani-se.github.io/pocketpulse
- **Backend (Google Cloud Run):** https://pocketpulse-api-898100665400.us-central1.run.app
- **Health Check:** https://pocketpulse-api-898100665400.us-central1.run.app/health

---

##  Architecture

- **Frontend:** React (Vite, React Bootstrap, SWR, Framer Motion)
- **Backend:** Express.js (Cloud Run)
- **Database:** MongoDB Atlas
- **Auth:** Google OAuth 2.0 (JWT)
- **External API:** Exchange Rates API (open.er-api.com)

---

##  Features

### Frontend (React)
- Google OAuth login
- Personalized dashboard per user
- Add / edit / delete transactions
- Filters by date, category, and type
- Currency conversion (USD → INR / EUR)
- Animated UI (Framer Motion)
- State management with Context + useReducer
- Third-party libraries: React Bootstrap, SWR, Framer Motion

### Backend (Express)
- REST API with full CRUD for transactions
- JWT authentication middleware
- MongoDB schema validation
- Centralized error handling
- Cloud-deployed on Google Cloud Run

---

##  API Endpoints

| Method | Endpoint | Description |
|------|---------|-------------|
| GET | /api/transactions | List transactions |
| POST | /api/transactions | Add transaction |
| PUT | /api/transactions/:id | Update transaction |
| DELETE | /api/transactions/:id | Delete transaction |

Authorization header required:
```
Authorization: Bearer <Google ID Token>
```

---

##  Automated Test

- Playwright E2E test included
- Tests basic dashboard rendering and mocked API behavior

Run:
```bash
npm run test:e2e
```

---

## Running Locally

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

Environment variables:
```env
VITE_BACKEND_URL=http://localhost:8080
GOOGLE_CLIENT_ID=898100665400-nq9krcjhsr578oftaji428scbkvc7cgc.apps.googleusercontent.com
MONGODB_URI=mongodb+srv://pocketpulse:pocketpulse@cluster1.tptb1lo.mongodb.net/pocketpulse?retryWrites=true&w=majority
```
---

## Deployment

### Backend
Deployed to **Google Cloud Run**
```bash
gcloud run deploy pocketpulse-api --source . --region us-central1 --allow-unauthenticated
```

### Frontend
Deployed to **GitHub Pages**
```bash
npm run build
npm run deploy
```

---

##  Design Artifact
A sequence diagram is included describing:
- Google OAuth login
- Authenticated API calls
- MongoDB persistence
- SWR revalidation

---

##  Demo Video

 *Link to demo video here*

---

##  Attribution

- Google OAuth documentation
- MongoDB Atlas docs
- Exchange Rates API: https://open.er-api.com
- React Bootstrap
- Framer Motion

---

##  Rubric Coverage

- ✔ React frontend (deployed)
- ✔ OAuth login
- ✔ Advanced React features (Context, useReducer)
- ✔ External API integration
- ✔ CRUD backend with validation
- ✔ Cloud deployment
- ✔ Automated test
- ✔ Design artifact
- ✔ Documentation

---

##  Author
Sreevani Jalagari  

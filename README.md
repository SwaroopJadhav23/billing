# Restaurant & Cafe Billing Management System

Production-ready MERN scaffold for a responsive restaurant POS and billing system.

## Apps

- `backend`: Express, MongoDB, JWT auth, RBAC, Socket.io, REST APIs
- `frontend`: React Vite, Tailwind CSS, React Router, React Query, Axios, Context API

## Quick Start

```bash
cd backend
cp .env.example .env
npm install
npm run dev

cd ../frontend
cp .env.example .env
npm install
npm run dev
```

Default backend URL: `http://localhost:5000/api`

## Deployment

Frontend is configured for Vercel with SPA routing. Backend is configured for Render with Node/Express.
Latest deployment trigger: Render and Vercel redeploy check.

Render backend must run with `NODE_ENV=production` and bind to Render's provided `PORT`.
Vercel frontend must set `VITE_API_URL` to the Render backend URL plus `/api`.

## Default Login

Seed the first admin by creating a user in MongoDB or by enabling your own registration/seed flow. The backend exposes protected resource APIs once authenticated.

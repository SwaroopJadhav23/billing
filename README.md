# Volmier Billing System

Production-ready MERN scaffold for a responsive Volmier Billing System.

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

## Demo seed commands

From `backend`:

```bash
npm run seed:kirana
npm run clear
npm run seed:bakery
```

- `seed:kirana` loads Kirana General Store demo products
- `clear` removes all demo/business data (keeps admin login)
- `seed:bakery` loads Bakery Store demo products


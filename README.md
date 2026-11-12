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

### Production env checklist (fixes stuck "Signing in...")

On **Render** (`billing-325u.onrender.com`):

- `MONGO_URI` must be a reachable MongoDB Atlas/local URI (old `cluster0.dqikk3i...` no longer resolves)
- `CLIENT_URL=https://billing1-chi.vercel.app` (comma-separate extra origins if needed)
- `JWT_SECRET` set
- After DB is fixed, run seed on Render shell or against that `MONGO_URI` (`npm run seed:toys`) so `toys@volmier.test` exists

On **Vercel**:

- `VITE_API_URL=https://billing-325u.onrender.com/api` (rebuild after changing)
- Open `https://billing-325u.onrender.com/health` — should return `{ "status": "ok", "db": "connected" }`

## Demo seed commands

From `backend`:

```bash
npm run seed:kirana
npm run clear
npm run seed:bakery
npm run seed:toys
```

- `seed:kirana` loads Kirana General Store demo products
- `clear` removes all demo/business data (keeps admin login)
- `seed:bakery` loads Bakery Store demo products
- `seed:toys` loads Toy Shop demo products


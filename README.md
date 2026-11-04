# KHALIIF SECOND HAND CLOTHES COMPANY — Management System
React + Vite + TypeScript + Tailwind frontend, Node + Express + TypeScript backend, MongoDB (Mongoose).

## Structure
```
backend/src  config/ controllers/ models/ routes/ middleware/ services/ utils/ types/ seed.ts server.ts app.ts
backend/uploads   uploaded images (git-ignored)
frontend/src components/ pages/ pages/admin/ layouts/ hooks/ services/ contexts/ routes/ types/ utils/
frontend/public/logo.png   company logo (replaceable from Dashboard > Settings)
docs/API.md   API documentation
```

## Setup
1. **Start MongoDB** (`mongod`, or the MongoDB service on Windows/macOS/Linux).
2. **MongoDB Compass:** connect to `mongodb://localhost:27017/`. The database `khaliif_second_hand_clothes` appears after the seed script runs.
3. **Backend**
   ```
   cd backend
   cp .env.example .env      # then edit JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
   npm install
   npm run seed              # creates Super Admin, categories, sample products, settings
   npm run dev               # http://localhost:5000
   ```
4. **Frontend**
   ```
   cd frontend
   cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
   npm install
   npm run dev               # http://localhost:5173
   ```
5. **Log in** at http://localhost:5173/login with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `backend/.env`. Create other users (Manager, Sales, Cashier) in Dashboard > Users.

## Environment variables
Backend `.env`: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. Frontend `.env`: `VITE_API_URL` only. Never commit `.env`; the MongoDB URI is never sent to the browser.

## Notes
- **Transactions:** sales and payments use MongoDB transactions when available. A standalone local MongoDB cannot run transactions, so the code falls back automatically (validation happens before writes). For full transaction safety run MongoDB as a single-node replica set (`mongod --replSet rs0`, then `rs.initiate()` and use `?replicaSet=rs0` in `MONGODB_URI`).
- **Roles:** Super Admin (all), Manager (products, stock, containers, sales, customers, reports, expenses, messages, settings), Sales (products, customers, sales), Cashier (sales, payments).
- **Map:** the Contact page uses OpenStreetMap once latitude/longitude are set in Settings (no API key needed), with a Google Maps directions link fallback.
- **Tax:** the tax rate setting is stored but not yet applied to invoices.
- Production: `npm run build` in both folders; serve `frontend/dist` and run `node backend/dist/server.js`.

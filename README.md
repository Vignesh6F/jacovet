# JacoVet - Enterprise Pet Health Platform

Welcome to **JacoVet**, an enterprise-grade client-server application for managing veterinarian consultation bookings and tracking lifelong pet medical histories.

---

## 🏗️ Architecture Stack

### Frontend (`client/`)
- **Core**: React + Vite
- **Routing**: React Router DOM (v6) for distinct dashboard URL pathways
- **API Queries**: TanStack Query (React Query) for state caching and sync mutations
- **Styles**: Tailwind CSS v3 with integrated HSL color palette
- **Data Graphs**: Recharts for visualizing pet weight history analytics

### Backend (`server/`)
- **Core**: Node.js + Express
- **ORM**: Prisma ORM with SQLite database integration (`dev.db`)
- **Authentication**: JWT token verification
- **Role Tier Security (RBAC)**: Custom middlewares protecting Owner, Doctor, Clinic Admin, and Super Admin scopes
- **Security Audit Logs**: Track metadata access and check-ins chronologically

---

## 🚀 Quick Start Guide

### 1. Database Initialization
Navigate to the `server/` directory, install packages, initialize the SQLite schema, and seed default mock records:
```bash
cd server
npm install
npm run db:push    # Creates schema structure in dev.db
npm run db:seed    # Populates mock clinics, vets, credentials, and histories
```

### 2. Run Backend Server
Start the Express server on port `5000` (runs in hot-reloading development mode using Nodemon):
```bash
npm run dev
```

### 3. Run Frontend Client
In a separate terminal tab, navigate to the `client/` folder, install packages, and start the Vite dev server:
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.

---

## 🔑 Default Credentials (for testing)

| Role | Username | Password / Passcode | Accessible Dashboard |
| :--- | :--- | :--- | :--- |
| **Pet Owner** | `owner@jacovet.com` | `owner125` / `owner123` | `/dashboard` (Pet profiles & QR) |
| **Veterinarian** | `doctor@jacovet.com` | `doctor123` | `/doctor` (Check-in & inventory) |
| **Clinic Admin** | `admin@jacovet.com` | `admin123` | `/admin` (Schedules & billing checkout) |
| **Super Admin** | `super@jacovet.com` | `super123` | `/super` (Security audit logs desk) |

---

## ✨ Features Implemented

1. **Lifelong Medical Record Timeline**: Tracks vitals, chief complaints (what caused the issue), itemized prescriptions, and vaccinations.
2. **Booster Immunization Calendar**: Automatically monitors booster statuses (**Active**, **Due Soon**, **Overdue**) and provides printable PDFs of Vaccine Certificates.
3. **Recharts Weight Analytics**: Displays visual LineCharts graphing the pet's weight changes over time.
4. **Cross-Clinic Consent Lookup**: Veterinarians can retrieve history files for any pet in the network. Retrieving a pet file from a different clinic logs a secure access entry in the audit trail.
5. **Clinic Monthly Inventory**: Stocks decrement automatically upon check-in checkouts. Managers can trigger manual stock replenishments.

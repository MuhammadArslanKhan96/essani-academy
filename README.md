# Essani Children Academy - School Management System

A full-stack, enterprise-grade School Management Software designed for **Essani Children Academy** (Garden West, Karachi). Built with React, Vite, TypeScript, Express, Prisma ORM, and modern UI design.

## Features & Modules

- **Academic Systems Management**: Dual support for **Matriculation** (Nursery - Class 10) and **O-Levels** (Grade 6 - O-3).
- **Academic Session Filtering**: Complete data segmentation across all modules based on active Academic Years (e.g. `2025-2026`, `2026-2027`).
- **Student Information System**:
  - Add single students or bulk import via Excel/CSV.
  - Track monthly fees, contact info, and enrollment system.
- **Fee Collection & WhatsApp Notices**:
  - Live fee status tracking (Paid / Unpaid).
  - Automated WhatsApp fee slip generation with direct `wa.me` dispatch.
- **Attendance Ledger**:
  - Daily logs for students and faculty.
  - Present, Absent, and Leave status management with real-time statistics.
- **Financial Accounts (Income & Expenditure)**:
  - Enterprise ledger for tracking salaries, utility bills, maintenance, tuition revenue, and net surplus.

---

## Project Structure

```text
├── api/                  # Vercel Serverless Function entrypoint
├── backend/              # Node.js Express REST API & Prisma ORM
│   ├── prisma/           # Prisma schema & database setup
│   └── src/              # Express controllers, routes, & services
├── frontend/             # React + Vite UI application
│   └── src/              # Components, design system & modules
├── vercel.json           # Vercel deployment configuration
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/moiz-xyz/essani-academy.git
   cd essani-academy
   ```

2. **Setup & Run Backend:**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npm run dev
   ```

3. **Setup & Run Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## Deployment on Vercel

This repository is pre-configured for one-click deployment on **Vercel**:

1. Push code to GitHub repository `moiz-xyz/essani-academy`.
2. Import project in Vercel Dashboard.
3. Vercel automatically uses `vercel.json` to deploy:
   - **Frontend**: Vite static build serving React UI.
   - **Backend**: Express API running as Vercel Serverless Functions under `/api/*`.

---

## License

Created for **Essani Children Academy**, Garden West, Karachi. All rights reserved.

# 🪙 CoinTrail - Multi-User Expense Tracker & Analytics

CoinTrail is a production-grade multi-user expense tracking and visual financial analytics platform built with **Spring Boot 3 (Java 21)**, **Spring Security (JWT)**, **PostgreSQL 17**, **React 19**, **Tailwind CSS**, and **Recharts**.

---

## 🌟 Key Features

### 🔐 Multi-User Authentication & Airtight Isolation
- **Stateless JWT Security**: HMAC-SHA512 token-based authentication with 7-day expiration and automatic session handling.
- **Strict Registration Validation**:
  - **Duplicate Prevention**: Real-time database & service-level checks preventing duplicate usernames, emails, or phone numbers.
  - **Strict Phone Number Validation**: Enforces standard **10-digit mobile numbers** with optional country code (`+919876543210` or `9876543210`).
  - **BCrypt Password Encryption**: All passwords safely hashed with salt before storage.
- **Flexible Sign In**: Users can log in using their **Username**, **Email**, OR **Phone Number**.
- **100% User Data Isolation**: Every category, transaction, overview metric, and chart is strictly isolated to the authenticated user.

### 📱 100% Responsive Design (Mobile, Tablet, Laptop)
- **Night Mode Default**: Modern dark mode by default with seamless light/dark switcher.
- **Mobile (< 640px)**: Zero horizontal overflow; touch-friendly transaction cards; bottom-sheet date filters; one-thumb Floating Action Button (FAB).
- **Tablet (640px – 1024px)**: Crisp 4-card metric grid; overflow-safe segmented preset controls; full transactions table.
- **Laptop / Desktop (≥ 1024px)**: Full desktop navbar with inline date presets, side-by-side analytics charts, and comprehensive sorting.

### 📊 Financial Visualizations & Category Management
- **Configurable Currency**: Default set to **₹ (INR)** with one-click switcher for **$ (USD)**, **€ (EUR)**, **£ (GBP)**, **¥ (JPY)**, **A$ (AUD)**, **C$ (CAD)**, **AED**, persisting across sessions.
- **Category Breakdown**: Interactive donut chart with category percentage shares and amounts.
- **Annual Spending Trend**: 12-month bar chart with year-over-year navigation and current month highlight.
- **Dynamic Categories**: 9 default pre-seeded categories plus full support for custom categories with custom colors and Lucide icons.

---

## 🛠️ Tech Stack

- **Backend**: Java 21, Spring Boot 3.4, Spring Security 6, Spring Data JPA, Hibernate, JJWT, PostgreSQL 17
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios

---

## 🚀 Running Locally

### 1. Database Setup (Local PostgreSQL)
Ensure your local PostgreSQL server is running and create the `cointrail` database:
```bash
/Library/PostgreSQL/17/bin/psql -U postgres -c "CREATE DATABASE cointrail;"
```

### 2. Start Backend (Spring Boot 3)
```bash
export DATABASE_URL="jdbc:postgresql://localhost:5432/cointrail"
export DATABASE_USERNAME="postgres"
export DATABASE_PASSWORD="your_postgres_password"

./mvnw spring-boot:run
```
The backend REST API will start at `http://localhost:8080`.

### 3. Start Frontend (React + Vite)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ☁️ 100% Free Cloud Deployment Guide

### 1. Database: [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com)
1. Create a free PostgreSQL instance on Neon or Supabase.
2. Copy the JDBC connection string with `sslmode=require`.

### 2. Backend: [Render.com](https://render.com)
1. Push this repository to GitHub.
2. Create a new **Web Service** on Render connected to this repo (uses root `Dockerfile`).
3. Set environment variables:
   - `DATABASE_URL`: `jdbc:postgresql://<neon-host>/neondb?sslmode=require`
   - `DATABASE_USERNAME`: `<your_db_user>`
   - `DATABASE_PASSWORD`: `<your_db_password>`
4. Deploy the service to get your API URL (e.g. `https://cointrail-api.onrender.com`).

### 3. Frontend: [Vercel](https://vercel.com)
1. Import your GitHub repository into Vercel.
2. Set Root Directory to `frontend`.
3. Set Environment Variable:
   - `VITE_API_URL`: `https://cointrail-api.onrender.com/api`
4. Deploy!

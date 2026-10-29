# Smart Household Service Booking and Tool Rental System

An enterprise-grade, full-stack MCA Capstone project providing on-demand household service bookings, rule-based technician matching, OpenStreetMap location routing, and inventory-managed tool rentals with automated security deposit and late-fee settlements.

---

## 🌟 Key System Features

1. **Multi-Role Access Control (RBAC)**:
   - **Customer**: Browse services/tools, book verified technicians, track jobs, simulate payments, rate technicians, and file grievances.
   - **Technician**: Manage weekly working schedule, toggle skill capabilities, review incoming service requests, and update work progress.
   - **Administrator**: Comprehensive governance console for technician approvals, service catalog management, tool inventory, return inspection, deposit settlement, and grievance resolution.
2. **Explainable Rule-Based Recommendation Engine**:
   - Scores and ranks technicians on a 0–100 scale using Service Match (40%), Average Rating (30%), Haversine GPS Distance (20%), and Working Slot Availability (10%).
3. **OpenStreetMap & Leaflet Integration**:
   - Zero paid API key dependency. Interactive map coordinate pin picker and customer-to-technician proximity route display.
4. **Tool Rental & Deposit Settlement Engine**:
   - Automatically computes rental fees, deducts inventory stock, assesses overdue late fees (`1.5 × daily rate`), records damage penalties, and calculates net refundable deposits upon return.
5. **In-App Real-Time Notifications**:
   - Event-driven notifications for booking lifecycle, payment confirmations, rental updates, and complaint resolutions.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Backend** | Java 17 / 25, Spring Boot 3.3.5, Spring Data JPA, Hibernate 6.5, Spring Security, JJWT 0.12.6, Maven |
| **Database** | MySQL 8.0 with HikariCP Connection Pooling & Auto Schema Migration (`ddl-auto=update`) |
| **Frontend** | React 18, Vite 5, Bootstrap 5, Bootstrap Icons, Leaflet 1.9, Axios, React Router 6 |
| **Security** | BCrypt Password Hashing, Stateless JWT Bearer Authentication, Strict Endpoint Authorization |

---

## 🚀 Quick Start & Setup Instructions

### 1. Prerequisites
- **Java Development Kit (JDK)**: Java 17 or higher (`java -version`)
- **Apache Maven**: 3.8+ (`mvn -version`)
- **Node.js & npm**: Node v18+ or v20+ (`node -v`)
- **MySQL Server**: 8.0 running on port 3306

---

### 2. Database Configuration
1. Open MySQL Command Line or MySQL Workbench:
```sql
CREATE DATABASE IF NOT EXISTS smart_household;
```
2. By default, the application connects to `localhost:3306/smart_household` with user `root`.
3. If you have set a MySQL root password, configure the environment variable:
```powershell
$env:DB_PASSWORD = "your_mysql_password"
```

---

### 3. Running the Backend Server
```powershell
cd backend
mvn spring-boot:run
```
The Spring Boot backend will start on **`http://localhost:8080/api`**.
*Database tables, seed categories, default equipment, and test accounts will be automatically created on initial startup.*

---

### 4. Running the React Frontend
```powershell
cd frontend
npm install
npm run dev
```
The Vite development server will start on **`http://127.0.0.1:5173/`**.

---

## 🔑 Demo Accounts for Examination & Evaluation

| Role | Email | Password | Pre-configured Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@smart.com` | `Admin@123` | Full dashboard metrics, approvals, catalog control, returns |
| **Technician 1** | `rajesh.tech@smart.com` | `Tech@123` | Electrician & AC Repair, Approved, 4.8 Rating, Bangalore |
| **Technician 2** | `suresh.tech@smart.com` | `Tech@123` | Plumbing & Home Cleaning, Approved, 4.9 Rating, Bangalore |
| **Customer** | `customer@smart.com` | `Customer@123` | Active customer profile with sample bookings & rentals |

---

## 📊 Core Business & Mathematical Formulations

### 1. Technician Recommendation Formula
$$\text{Recommendation Score} = \text{Service Match (40)} + \left(\frac{\text{Rating}}{5.0} \times 30\right) + \max(0, 20 - (\text{Distance}_{\text{km}} \times 0.5)) + \text{Availability (10)}$$

### 2. Tool Return & Deposit Calculation
$$\text{Rental Amount} = \text{Daily Rate} \times \text{Rental Days}$$
$$\text{Late Fee} = \max(0, \text{Actual Return Date} - \text{End Date}) \times (\text{Daily Rate} \times 1.5)$$
$$\text{Refundable Deposit} = \max(0, \text{Security Deposit} - (\text{Late Fee} + \text{Damage Charge}))$$

---

## 📮 API Documentation & Postman Collection

A complete Postman collection is provided in the repository root:
[`smart_household_postman_collection.json`](./smart_household_postman_collection.json).

### Core API Summary

#### 1. Authentication
- `POST /api/auth/register` - Register Customer or Technician
- `POST /api/auth/login` - Authenticate and obtain JWT Bearer token

#### 2. Services & Catalog (Public)
- `GET /api/services` - List all active services
- `GET /api/tools` - List available rental tools
- `GET /api/technicians/recommended` - Rule-based ranked technicians with GPS distance

#### 3. Customer Operations (`ROLE_CUSTOMER`)
- `GET /api/customer/profile` & `PUT /api/customer/profile` - Profile & OpenStreetMap location
- `POST /api/customer/bookings` & `GET /api/customer/bookings` - Service bookings
- `POST /api/customer/rentals` & `GET /api/customer/rentals` - Tool rentals
- `POST /api/customer/payments` - Simulated checkout
- `POST /api/customer/reviews` - Submit review & update technician rating
- `POST /api/customer/complaints` - File grievance ticket

#### 4. Technician Hub (`ROLE_TECHNICIAN`)
- `GET /api/technician/bookings` - View assigned jobs
- `PUT /api/technician/bookings/{id}/status` - Update status (`ACCEPTED`, `IN_PROGRESS`, `COMPLETED`)
- `POST /api/technician/availability` - Configure weekly working slots

#### 5. Administration (`ROLE_ADMIN`)
- `GET /api/admin/dashboard/summary` - Aggregate system metrics
- `PUT /api/admin/technicians/{id}/status` - Approve / reject technician verification
- `PUT /api/admin/rentals/{id}/process-return` - Inspect tool, apply late fees/damages & refund deposit
- `PUT /api/admin/complaints/{id}` - Post admin response & resolve grievance

---

## 🧪 Automated Testing

To run the automated integration and unit test suite:
```powershell
cd backend
mvn test
```
**Results:** `13/13 Tests Passed (100% Green)` covering security, state machines, deposit formulas, and recommendation ranking.

---

## 📄 License & Authorship
Developed for MCA Master of Computer Applications Capstone Project.
Licensed under MIT.
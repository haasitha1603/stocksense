# StockSense 📦⚡

> **AI-Powered Multi-Warehouse Inventory Intelligence & Optimization Platform**  
> *Know what you have. See what could go wrong. Know what to do next — and verify the result.*

---

## 🌟 Executive Overview

StockSense is an enterprise-grade, multi-warehouse inventory management and decision-intelligence platform built for high-throughput supply chain and warehouse operators.

Unlike conventional inventory CRUD tools or black-box predictive dashboards, StockSense unites:
1. **Odoo-Grade Inventory Invariants**: Atomic transactional state transitions for Receipts, Deliveries, Inter-Warehouse Transfers, and Physical Count Adjustments with an immutable append-only audit ledger (`StockMovement`).
2. **Deterministic Risk & Explainable Forecasting**: 30-day outbound demand velocity calculations, days-of-cover analysis, and impact-weighted risk scoring factoring in business criticality, supplier lead time, and minimum order quantities.
3. **Zero-Mutation What-If Decision Lab**: A sandbox simulation engine allowing managers to stress-test demand surges, supplier transit delays, and transfer quantities without altering database state (`is_mutation_performed: false`).
4. **Grounded AI Inventory Copilot**: Powered by Google's `gemini-3.8-flash` via the official `google-genai` SDK, with grounded prompts constrained to real database state and seamless offline deterministic fallbacks.

---

## 🎯 The 30-Second Core Operational Loop

StockSense guarantees managers can resolve inventory risks in under 30 seconds:

```
[1. Dashboard Overview]       --> Spot Critical Risk (Steel Rods, 6.1 days cover remaining)
         ↓
[2. Risk & Reorder Radar]     --> Review explainable formula & cross-warehouse surplus
         ↓
[3. What-If Decision Lab]     --> Simulate 40-unit transfer from Warehouse B (Stockout averted!)
         ↓
[4. Human-Authorized Action]  --> Execute atomic inter-warehouse transfer with 1 click
         ↓
[5. Audit Ledger & Balances]  --> Verify company conservation invariant & ledger confirmation
```

---

## 🚀 Key Features & Architectural Guarantees

### 1. Robust Operational Invariants
- **Inbound Receipts**: Atomic transition from `draft` to `done`. Increments destination location stock and logs ledger credit with reference link.
- **Outbound Deliveries**: Checks real-time physical availability prior to validation. Atomic stock reduction prevents negative inventory allocations.
- **Inter-Warehouse Transfers**: Strictly conserves total company balance. A single atomic database transaction deducts stock from Source and credits Destination, logging paired audit ledger entries sharing an identical `transfer_link_id`.
- **Physical Count Adjustments**: Computes signed discrepancy (`counted - system`). Atomic balance update with auditable reason codes (`damaged`, `theft`, `count_error`, `expired`).

### 2. Explainable Intelligence Formulas
- **Daily Demand Rate**: Calculated exclusively from validated outbound customer deliveries over a configurable 30-day rolling window:
  $$\text{Daily Demand} = \frac{\sum \text{Delivered Quantity (last 30 days)}}{30}$$
- **Days of Stock Cover**:
  $$\text{Days of Cover} = \frac{\text{Current On-Hand Stock}}{\text{Daily Demand}}$$
- **Reorder Point & Quantity**:
  $$\text{Safety Stock} = \text{Daily Demand} \times \text{Safety Buffer (e.g. 5 days)}$$
  $$\text{Reorder Point} = (\text{Daily Demand} \times \text{Lead Time}) + \text{Safety Stock}$$
  $$\text{Recommended Quantity} = \max(\text{Reorder Point} - \text{On-Hand}, \text{MOQ})$$
- **Impact-Weighted Risk Score**:
  $$\text{Risk Score} = \min(100, \text{Urgency Factor} \times \text{Criticality Multiplier})$$
  *(Critical = 1.5×, High = 1.25×, Medium = 1.0×, Low = 0.75×)*

### 3. Grounded AI Copilot (`gemini-3.8-flash`)
- Constrained strictly to active PostgreSQL state.
- Injects warehouse stock levels, pending inbound receipts, outbound pipeline, and supplier lead times into prompt context.
- Fallback engine: When no external API key is configured or offline, StockSense generates deterministic intelligence recommendations instantly without breaking.

---

## 🏗️ System Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Frontend (React 19 + TypeScript)            │
│  - Tailwind CSS v4 styling & Dark/Light theme toggle        │
│  - Recharts interactive demand trajectories                 │
│  - Lucide icons, responsive drawer, accessible forms        │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API / JWT
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Backend (FastAPI + Python 3.11+)            │
│  - SQLAlchemy 2.0 ORM with PostgreSQL 18                    │
│  - Pydantic v2 schemas and validation                       │
│  - Atomic transactions (session.commit / rollback)          │
│  - Official google-genai SDK (gemini-3.8-flash)             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 PostgreSQL 18 Database (Relational)          │
│  - Normalized schema (Products, Warehouses, StockLevels)    │
│  - Immutable append-only audit trail (StockMovements)       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎬 Demo Storyboard & Golden Dataset

The pre-seeded database contains a realistic industrial scenario ready for presentation:

| SKU | Name | Category | Criticality | Main WH Stock | WH B Stock | Daily Demand | Lead Time | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SKU-STL-001** | **Steel Rods** | Raw Materials | **Critical** | **85** | **160** | ~14 / day | 10 days | ⚠️ **Stockout in 6.1 days** |
| **SKU-PCB-002** | Circuit Boards | Electronics | High | 420 | 180 | ~18 / day | 14 days | ✅ Optimal (~23 days cover) |
| **SKU-HYD-003** | Hydraulic Valves | Components | Critical | 65 | 90 | ~6 / day | 12 days | ⚡ Reorder in 5 days |
| **SKU-COA-004** | Copper Coils | Raw Materials | Medium | 310 | 0 | ~8 / day | 21 days | ✅ Stable (~38 days cover) |
| **SKU-MOT-005** | Electric Motors | Assemblies | High | 45 | 110 | ~5 / day | 15 days | ⚠️ Low buffer |

### Verified Storyboard Walkthrough:
1. **Hero Problem**: Steel Rods at Main Warehouse will stock out in **6.1 days**, while supplier lead time is **10 days**. A standard purchase order will arrive 3.9 days too late, halting production!
2. **Surplus Identification**: The Intelligence Engine discovers Warehouse B holds **160 units** with low local burn rate.
3. **Simulation**: The manager opens the **What-If Decision Lab**, simulates transferring **40 units** from Warehouse B to Main Warehouse. The projected stockout date is delayed beyond supplier replenishment lead time!
4. **Action**: The manager validates the transfer. Stock levels update atomically (Main: 85 → 125, WH B: 160 → 120), and dual ledger entries are committed with shared link ID.

---

## 💻 Quick Start & Installation

### Prerequisites
- **Node.js** (v18+ or v20+)
- **Python** (v3.10+)
- **PostgreSQL 18** (running locally on port 5432)

### 1. Database Setup
Ensure PostgreSQL is running and create the database:
```sql
CREATE DATABASE stocksense_db;
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env configuration (never commit .env to source control)
# Copy from .env.example
copy .env.example .env

# Seed initial demonstration data
python -m app.db.seed

# Run automated test suite
python -m pytest tests/

# Launch API server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The FastAPI backend will be available at: `http://localhost:8000` (Swagger docs: `http://localhost:8000/docs`).

### 3. Frontend Setup
```bash
cd frontend

# Install packages
npm install

# Build production bundle (verifies TypeScript types)
npm run build

# Start Vite development server
npm run dev
```
The StockSense UI will be running at: `http://localhost:5173`.

---

## 🔐 Demo Credentials

Use the pre-seeded administrator credentials to log in:
- **Email**: `admin@stocksense.io`
- **Password**: `password123`

*(The login screen also includes a **Demo Admin Auto-Fill** button for instant one-click access.)*

---

## 🧪 Automated Testing

StockSense includes an end-to-end integration test suite verifying:
- Authentication & JWT token issuance.
- Atomic stock level increments & ledger creation on Receipts.
- Availability validation on Deliveries.
- Inter-warehouse conservation invariant and paired movements.
- Demand calculation accuracy, safety stock, and reorder formulas.
- Zero-mutation guarantee in the What-If simulation engine.

Run tests:
```bash
cd backend
python -m pytest tests/ -v
```

---

## 🛡️ Security, Privacy & Integrity
- **Secrets Isolation**: All credentials, JWT keys, and API tokens are loaded via environment variables and excluded from source control.
- **GDPR & Privacy Compliance**: Includes a live Privacy Policy page with an interactive GDPR deletion request form and cookie consent banner.
- **Audit Trails**: Every inventory modification logs user ID, timestamp, source/destination locations, and linked transaction references.

---

## 📄 License
This project is developed for hackathon demonstration under the MIT License.

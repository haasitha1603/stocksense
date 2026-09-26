# StockSense 📦⚡
<<<<<<< HEAD

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
=======
### AI-Powered Inventory Intelligence & Operational Optimization Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python: 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React: 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript: 5.x](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL: 15+](https://img.shields.io/badge/PostgreSQL-15%2B-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS: 3.4](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2D8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![WCAG 2.2: AA](https://img.shields.io/badge/Accessibility-WCAG_2.2_AA-success?logo=w3c&logoColor=white)](https://www.w3.org/WAI/standards-guidelines/wcag/)

> **"Know what you have. See what could go wrong. Know what to do next — and verify the result."**

---

## 📑 Table of Contents

1. [Executive Summary & 30-Second Elevator Pitch](#-executive-summary--30-second-elevator-pitch)
2. [Problem Statement & Product Vision](#-problem-statement--product-vision)
3. [Core Differentiators & Innovation](#-core-differentiators--innovation)
4. [System Architecture & Data Flow](#-system-architecture--data-flow)
5. [Operational Workflows (Odoo Hackathon Core)](#-operational-workflows-odoo-hackathon-core)
6. [Explainable Intelligence & Decision Support Engine](#-explainable-intelligence--decision-support-engine)
7. [The "What If? Decision Lab" (Interactive Scenario Simulator)](#-the-what-if-decision-lab-interactive-scenario-simulator)
8. [Database Schema & Ledger Invariants](#-database-schema--ledger-invariants)
9. [REST API Specification](#-rest-api-specification)
10. [Design System, UX & Accessibility Standards](#-design-system-ux--accessibility-standards)
11. [Repeatable Demo Dataset & 3-Minute Judging Storyboard](#-repeatable-demo-dataset--3-minute-judging-storyboard)
12. [Installation, Configuration & Quickstart](#-installation-configuration--quickstart)
13. [Verification, Testing & Invariant Acceptance Criteria](#-verification-testing--invariant-acceptance-criteria)
14. [Project Directory Layout](#-project-directory-layout)
15. [Security, Privacy & Row-Level Isolation](#-security-privacy--row-level-isolation)
16. [Non-Goals & Honest Boundaries](#-non-goals--honest-boundaries)
17. [Hackathon Roadmap (P0 / P1 / P2)](#-hackathon-roadmap-p0--p1--p2)
18. [License & Acknowledgments](#-license--acknowledgments)

---

## ⚡ Executive Summary & 30-Second Elevator Pitch

**StockSense** is an enterprise-grade multi-warehouse inventory intelligence platform engineered for modern logistics operators, warehouse managers, and supply chain leads. 

Unlike conventional inventory systems that operate as passive CRUD databases (recording stock changes *after* the fact), StockSense combines **strict, transaction-safe operational workflows** with **deterministic, explainable predictive analytics** and an interactive **What If? Decision Simulation Lab**. 

### The 30-Second Judging Loop
Within **30 seconds** of launching StockSense, any judge or operator can complete the full decision lifecycle:

```mermaid
flowchart LR
    A["1. Current State<br/>(Live Stock & Balances)"] --> B["2. Risk Detection<br/>(Stockout & Lead Time)"]
    B --> C["3. Explainable Prediction<br/>(Formula + Inputs)"]
    C --> D["4. What If? Simulation<br/>(Safe Sandbox Comparison)"]
    D --> E["5. Authorized Action<br/>(Receipt / Transfer / Reorder)"]
    E --> F["6. Immutable Ledger<br/>(Double-entry Audit Trail)"]
    
    style A fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff
    style B fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#fff
    style C fill:#1e293b,stroke:#8b5cf6,stroke-width:2px,color:#fff
    style D fill:#1e293b,stroke:#06b6d4,stroke-width:2px,color:#fff
    style E fill:#1e293b,stroke:#10b981,stroke-width:2px,color:#fff
    style F fill:#1e293b,stroke:#64748b,stroke-width:2px,color:#fff
```

> [!IMPORTANT]
> **Data Grounding Guarantee:** All forecasts, risk scores, transfer recommendations, and simulation outputs are calculated directly from persisted, tenant-isolated PostgreSQL records using deterministic mathematical models. If optional LLM/copilot services fail or are disconnected, **100% of core inventory operations and intelligence features continue running uninterrupted**.

---

## 🎯 Problem Statement & Product Vision

### The Problem
Small to mid-sized warehouse operations often struggle with fragmented inventory tracking:
* **The Spreadsheet Crisis:** Manual registers, disconnected Excel sheets, and paper stock count notes introduce latency, typos, and stale inventory data.
* **Invisible Stockout Surprises:** Reorders happen reactively when a bin is empty, failing to factor in supplier lead-time fluctuations and historical demand velocity.
* **Capital Stranded in Dead Stock:** Working capital sits trapped in slow-moving items at Warehouse A while Warehouse B experiences critical stockouts of the exact same SKU.
* **Audit Blindspots:** Edits to stock numbers overwrite history, erasing who changed what, why the discrepancy occurred, and whether discrepancies stem from shrinkage or recording errors.

### The StockSense Vision
Traditional inventory software answers: *"What stock do I have?"*  
**StockSense answers:** *"What do I have, what is likely to happen next, what is the business impact, what-if we transfer vs reorder, and did the action solve the problem?"*

| Dimension | Traditional IMS (Spreadsheets / Basic CRUD) | StockSense Intelligence Platform |
| :--- | :--- | :--- |
| **Data Integrity** | Overwrites row values; silent edits | **Immutable append-only ledger** with paired double-entry transfers |
| **Forecasting** | Intuition, guesswork, or black-box claims | **Explainable statistical models** (WMA/SMA) with transparent inputs |
| **Decision Support** | Static "Low Stock" red text | **Ranked action recommendations** weighted by business criticality |
| **Risk Evaluation** | Blind commit directly to production DB | **"What If? Decision Lab"** for zero-risk side-by-side simulation |
| **Rebalancing** | Manual phone calls between warehouses | **Source-safe transfer optimizer** preserving local safety stock |
| **Auditability** | Untracked discrepancies | **Strict status state machines** (Draft $\rightarrow$ Ready $\rightarrow$ Done) + actor logs |

---

## 🚀 Core Differentiators & Innovation

1. **Deterministic, Traceable Intelligence:** Every recommendation presents its exact inputs: current stock, lead time, historical velocity, safety buffers, and mathematical formula. No black-box guesses.
2. **First-Class "What If? Decision Lab":** A dedicated interactive simulation workspace where managers compare demand surges, supplier delays, or inter-warehouse transfers side-by-side before executing live operations.
3. **Double-Entry Internal Warehouse Transfers:** Internal transfers generate linked `TRANSFER_OUT` and `TRANSFER_IN` movements under a single atomic transaction, ensuring the company-wide stock invariant is mathematically conserved ($\Delta = 0$).
4. **Impact-Weighted Business Criticality:** Products are classified by criticality (`Critical`, `Standard`, `Low`), ensuring high-impact risks bubble to the top even if low-criticality items have higher statistical probability.
5. **Grounded AI Copilot:** A read-only assistant that queries authorized SQL endpoints and cites exact warehouse, product, and movement records. Never fabricates inventory facts.
6. **Zero-Flicker Reactive UI:** Powered by TanStack Query and optimistic cache invalidation; mutations update stock levels, timeline charts, and ledger records instantly without full-page reloads.

---

## 🏗️ System Architecture & Data Flow

StockSense is built with a modular, decoupled architecture adhering to the Repository-Service pattern on the backend and an Atomic Component pattern on the frontend.

```mermaid
flowchart TB
    subgraph Client["Frontend Client (React 18 + Vite + TS)"]
        UI["UI Layer<br/>(Tailwind CSS + shadcn/ui + Framer Motion)"]
        State["State & Cache Management<br/>(TanStack Query + React Context)"]
        Views["Views: Dashboard | Operations | Intelligence | What If? | Ledger"]
    end

    subgraph API["Backend API Gateway (FastAPI + Pydantic v2)"]
        AuthMid["Auth & Tenant Middleware<br/>(JWT + RBAC + Scope Validator)"]
        Routers["REST Routers<br/>/inventory | /operations | /intelligence | /scenarios"]
        ServiceLayer["Service Layer<br/>(StockService | TransferService | ForecastService)"]
    end

    subgraph Engine["Intelligence & Simulation Engine"]
        StatEngine["Statistical Engine<br/>(WMA Demand | Stockout Cover | Reorder Formula)"]
        SimLab["What If? Decision Sandbox<br/>(In-Memory Non-Mutating Simulator)"]
        LLMAdapter["Grounded AI Copilot<br/>(Read-Only Tool Dispatcher)"]
    end

    subgraph Persistence["Persistence & Storage (PostgreSQL 15+)"]
        RLS["Tenant Row-Level Security (RLS)"]
        Tables["Relational Schema<br/>Products | Locations | StockLevels | Operations"]
        Ledger["Append-Only Stock Ledger<br/>(Immutable Audit Log)"]
    end

    UI --> State
    State --> Views
    Views --> AuthMid
    AuthMid --> Routers
    Routers --> ServiceLayer
    ServiceLayer --> StatEngine
    ServiceLayer --> SimLab
    ServiceLayer --> LLMAdapter
    ServiceLayer --> RLS
    RLS --> Tables
    Tables --> Ledger
```

### Technology Stack Justification

* **Frontend:** 
  * `React 18` + `TypeScript`: Type-safe component trees preventing UI runtime errors.
  * `Tailwind CSS` + `shadcn/ui`: Clean, high-density operational SaaS aesthetics with native dark/light theme tokens.
  * `TanStack Query (React Query)`: Automatic query deduplication, server-state caching, and instant cache invalidation upon mutations.
  * `Recharts`: High-performance SVG visualization for demand curves, inventory distribution, and scenario comparisons.
* **Backend:** 
  * `Python 3.11` + `FastAPI`: Asynchronous, high-throughput REST API with automatic OpenAPI documentation and strict Pydantic v2 schema validation.
  * `SQLAlchemy 2.0 (Async)`: Modern Python ORM providing explicit transaction management, select-in loading, and strict database isolation.
  * `Alembic`: Versioned database migration scripts ensuring repeatable deployments.
* **Database:** 
  * `PostgreSQL 15+`: Relational integrity, ACID compliance, check constraints, row-level locking (`SELECT ... FOR UPDATE`), and native Row-Level Security (RLS).

---

## 📦 Operational Workflows (Odoo Hackathon Core)

StockSense satisfies all functional requirements outlined in the standard Odoo IMS specification, wrapped in robust ACID transaction boundaries.

```mermaid
stateDiagram-v2
    [*] --> Draft : Create Operation
    Draft --> Waiting : Submit for Picking / Review
    Waiting --> Ready : Stock Allocated / Goods Arrived
    Ready --> Done : Validate Operation (Atomic Mutation)
    Draft --> Cancelled : Discard
    Waiting --> Cancelled : Reject / Cancel
    Ready --> Cancelled : Cancel Allocation
    Done --> [*] : Immutable Ledger Written
```

### 1. Receipts (Inbound Goods)
* **Trigger:** Vendor delivery arrives at a specified warehouse.
* **Workflow:** `Draft` $\rightarrow$ `Waiting` $\rightarrow$ `Ready` $\rightarrow$ `Done`.
* **Invariant:** Inventory levels **do not mutate** until the explicit transition to `Done`.
* **Execution:** Updates target location `StockLevel` atomically, adds line items, and records a signed `RECEIPT` entry in the append-only stock ledger. Idempotent guards prevent double-counting upon network retry.

### 2. Delivery Orders (Outbound Shipments)
* **Trigger:** Customer sales order or outbound shipping request.
* **Workflow:** `Draft` $\rightarrow$ `Picking` $\rightarrow$ `Packed` $\rightarrow$ `Done`.
* **Stock Invariant:** Validates that `Available Stock` $\ge$ `Requested Quantity`. If insufficient stock exists at the source location, the transaction **fails closed** with a detailed per-item deficit message. No partial or unlogged decrements are permitted.
* **Ledger Record:** Appends `DELIVERY` movement with negative signed delta.

### 3. Internal Warehouse Transfers
* **Trigger:** Rebalancing stock from Central Store to Production Floor, or Rack A to Rack B.
* **Validation:** Source and destination locations must be distinct. Source must have sufficient available stock.
* **Double-Entry Paired Ledger Invariant:**
  * Atomically decrements source location (`quantity = quantity - N`).
  * Atomically increments destination location (`quantity = quantity + N`).
  * Writes two linked ledger records sharing a single `transfer_id`:
    1. `TRANSFER_OUT` at Source Location ($-N$)
    2. `TRANSFER_IN` at Destination Location ($+N$)
  * **Global Conservation:** $\Delta \text{Company Stock} = 0$.

### 4. Inventory Adjustments (Physical Cycle Counting)
* **Trigger:** Physical stocktake reveals discrepancies due to shrinkage, damage, or misplacement.
* **Workflow:** Manager enters counted quantity and selects a mandatory audit reason (`Damaged`, `Missing`, `Count Error`, `Expired`).
* **Calculation:** $\text{Discrepancy Delta} = \text{Counted Quantity} - \text{System Recorded Quantity}$.
* **Execution:** System sets stock level directly to the counted quantity, stores previous balance, new balance, signed delta, timestamp, actor ID, and audit reason in the immutable ledger.

---

## 🧠 Explainable Intelligence & Decision Support Engine

StockSense rejects opaque black-box AI. All statistical metrics and recommendations are deterministic, fully inspectable, and derived from persisted historical records.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STOCKSENSE INTELLIGENCE PIPELINE                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Outbound Demand Movements Only (Deliveries) ──► Lookback Filter (30/60 Days)│
│                                                                             │
│                                      ▼                                      │
│               Weighted Moving Average (WMA) Demand Rate                     │
│                                      ▼                                      │
│        ┌─────────────────────────────┴─────────────────────────────┐        │
│        ▼                                                           ▼        │
│  Stockout Horizon (Cover Days)                            Reorder Recommender│
│  = Current Stock / Daily Demand                      Formula-backed Qty calc│
│        │                                                           │        │
│        └─────────────────────────────┬─────────────────────────────┘        │
│                                      ▼                                      │
│                         Impact-Weighted Risk Scorer                         │
│                    Risk Exposure × Business Criticality                     │
│                                      ▼                                      │
│                       Source-Safe Transfer Optimizer                        │
│                 Surplus at Source ──► Deficit at Destination                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1. Demand Velocity Estimation (WMA)
Customer demand is computed exclusively from completed outbound `DELIVERY` movements. Inbound receipts, internal transfers, and manual adjustments are explicitly excluded from customer demand velocity:
$$\text{Average Daily Demand} (\bar{D}) = \frac{\sum_{i=1}^{N} w_i \cdot D_i}{\sum_{i=1}^{N} w_i}$$
* **Default Lookback Window:** 30 days.
* **Minimum Data Requirement:** At least 5 distinct outbound movement data points over a 14-day span.
* **Insufficient Data Fallback:** If historical records fall below the threshold, the system displays:
  > *"Insufficient historical data for reliable forecasting. Minimum 14 days of outbound movement history required."*  
  *(No fabricated numbers or hallucinations).*

### 2. Stockout Horizon (Days of Cover)
$$\text{Days of Cover} = \begin{cases} \frac{\text{Available Stock}}{\bar{D}}, & \text{if } \bar{D} > 0 \\ \infty \text{ (Safe / Inactive)}, & \text{if } \bar{D} = 0 \end{cases}$$
If days of cover is less than the supplier lead time plus safety buffer, a **Stockout Warning** is raised with exact days remaining.

### 3. Reorder Recommendation Engine
Recommendations calculate the precise replenishment quantity rounded to ordering package units:
$$\text{Suggested Order} = \max\left(0, \left(\bar{D} \times L\right) + \text{SS} + \text{Target Cycle} - \text{Usable Stock} - \text{Incoming}\right)$$
* $L$: Supplier Lead Time (days).
* $\text{SS}$: Safety Stock Buffer ($Z \times \sigma_L$).
* $\text{Usable Stock}$: On-Hand minus active reservations.
* $\text{Incoming}$: Purchase receipts currently in `Waiting` or `Ready` state.

### 4. Impact-Weighted Risk Scoring Matrix
StockSense separates **statistical likelihood** from **business criticality**:

$$\text{Priority Score} = \text{Stockout Likelihood Factor} \times \text{Business Criticality Weight}$$

| Business Criticality | Weight Multiplier | Description |
| :--- | :---: | :--- |
| **Critical** | $\times 3.0$ | Production-halting components or flagship revenue drivers |
| **Standard** | $\times 1.5$ | Regular operational products with standard supplier availability |
| **Low** | $\times 0.8$ | Non-essential supplies or easily substitutable SKUs |

*Result:* A Critical product with 6 days of cover outranks a Low-criticality product with 3 days of cover, ensuring operational triage targets the highest business risk first.

### 5. Dead & Slow Stock Capital Analysis
Identifies capital tied up in warehouses with zero customer demand over a 45+ day window:
$$\text{Tied-Up Capital} = \text{On-Hand Stock} \times \text{Unit Cost}$$
If unit cost is missing from catalog data, StockSense displays *"Cost data unavailable"* rather than fabricating valuation.

---

## 🧪 The "What If? Decision Lab" (Interactive Scenario Simulator)

The **What If? Decision Lab** is a first-class MVP innovation that allows managers to stress-test decisions in an isolated, read-only simulation environment.

```mermaid
sequenceDiagram
    autonumber
    actor Manager as Warehouse Manager
    participant UI as What If? UI Sandbox
    participant API as /api/v1/scenarios/simulate
    participant Engine as Simulation Engine
    participant DB as PostgreSQL (Read-Only)

    Manager->>UI: Select SKU ("Steel Rods") & Adjust Sliders (+30% Demand, +5d Lead Time)
    UI->>API: POST /api/v1/scenarios/simulate {sku, demand_delta: 0.3, lead_time_delta: 5}
    API->>DB: Fetch Baseline Stock, WMA Demand & Active Transfers
    DB-->>API: Persisted Baseline Records
    API->>Engine: Run In-Memory Simulation Model
    Engine-->>API: Return Baseline vs Simulated Horizon & Stockout Dates
    API-->>UI: 200 OK (Simulation Projections + Explanations)
    Note over DB: ZERO DATABASE MUTATIONS OCCUR
    UI->>Manager: Render Side-by-Side Comparison Matrix
    Manager->>UI: Click "Proceed with Recommended Transfer (40 Units)"
    UI->>Manager: Redirect to Pre-filled Transfer Form (Draft State)
```

### Simulation Scenarios Supported:
1. **Demand Surge / Slump:** Test a $+20\%$ to $+100\%$ spike in customer shipments over a 7-day, 14-day, or 30-day horizon.
2. **Supplier Lead-Time Shock:** Simulate supply chain bottlenecks (e.g., supplier lead time doubles from 7 to 14 days).
3. **Inter-Warehouse Rebalancing:** Simulate transferring $N$ units from Warehouse B to Warehouse A; inspect whether Warehouse B remains above safety stock while Warehouse A avoids stockout.

> [!NOTE]
> **Strict Non-Mutation Guarantee:** The `/scenarios/simulate` endpoint is completely read-only. It executes zero `INSERT`, `UPDATE`, or `DELETE` statements. Executing an operation requires explicit human confirmation via standard validated forms.

---

## 🗄️ Database Schema & Ledger Invariants

The data model is engineered in PostgreSQL with strict foreign keys, check constraints, composite indexes, and decimal precision for monetary figures.

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ USERS : contains
    ORGANIZATIONS ||--o{ WAREHOUSES : owns
    ORGANIZATIONS ||--o{ PRODUCTS : catalogs
    WAREHOUSES ||--o{ LOCATIONS : contains
    PRODUCTS ||--o{ STOCK_LEVELS : tracks
    LOCATIONS ||--o{ STOCK_LEVELS : houses
    
    PRODUCTS ||--o{ STOCK_LEDGER : audits
    LOCATIONS ||--o{ STOCK_LEDGER : references
    
    RECEIPTS ||--o{ RECEIPT_ITEMS : contains
    WAREHOUSES ||--o{ RECEIPTS : receives_at
    
    DELIVERIES ||--o{ DELIVERY_ITEMS : contains
    WAREHOUSES ||--o{ DELIVERIES : ships_from
    
    TRANSFERS ||--o{ TRANSFER_ITEMS : contains
    LOCATIONS ||--o{ TRANSFERS : source_loc
    LOCATIONS ||--o{ TRANSFERS : dest_loc
    
    ORGANIZATIONS {
        uuid id PK
        varchar name
        varchar slug
        timestamp created_at
    }
    
    PRODUCTS {
        uuid id PK
        uuid org_id FK
        varchar sku UK
        varchar name
        varchar category
        varchar unit_of_measure
        numeric unit_cost
        integer reorder_level
        integer target_stock
        integer lead_time_days
        varchar business_criticality
        boolean is_active
    }
    
    STOCK_LEVELS {
        uuid id PK
        uuid product_id FK
        uuid location_id FK
        numeric on_hand
        numeric reserved
        numeric available
        timestamp updated_at
    }
    
    STOCK_LEDGER {
        uuid id PK
        uuid org_id FK
        uuid product_id FK
        uuid location_id FK
        varchar movement_type
        numeric quantity_delta
        numeric balance_before
        numeric balance_after
        varchar reference_type
        uuid reference_id
        varchar reason
        uuid actor_id FK
        timestamp created_at
    }
```

### Movement Type Classifications
Every entry in `stock_ledger` uses a strict movement type enumeration:
* `RECEIPT`: Inbound inventory addition from external vendor.
* `DELIVERY`: Outbound customer shipment deduction.
* `TRANSFER_OUT`: Outbound half of internal warehouse transfer.
* `TRANSFER_IN`: Inbound half of internal warehouse transfer.
* `ADJUSTMENT`: Physical stocktake delta correction (positive or negative).
* `SCRAP_DAMAGE`: Disposal of damaged or expired goods.

---

## 🔌 REST API Specification

All endpoints are prefixed with `/api/v1` and return standardized JSON envelopes.

### Authentication & Tenant
| Method | Endpoint | Description | Auth / Role |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new organization & admin user | Public |
| `POST` | `/auth/login` | Authenticate with credentials $\rightarrow$ returns JWT | Public |
| `GET` | `/auth/me` | Fetch active user profile, permissions & tenant | Authenticated |

### Catalog & Warehouses
| Method | Endpoint | Description | Auth / Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | List products with pagination, search, category & stock filters | Authenticated |
| `POST` | `/products` | Create new SKU with reorder parameters & criticality | Operator+ |
| `GET` | `/products/{id}/profile`| Fetch comprehensive AI Product Profile & demand metrics | Authenticated |
| `GET` | `/warehouses` | List warehouses and nested storage locations | Authenticated |
| `GET` | `/inventory/stock-levels`| Query available, on-hand, and reserved stock by location | Authenticated |

### Operational Workflows
| Method | Endpoint | Description | Auth / Role |
| :--- | :--- | :--- | :--- |
| `POST` | `/operations/receipts` | Create inbound receipt draft | Operator+ |
| `POST` | `/operations/receipts/{id}/validate` | Validate receipt $\rightarrow$ atomically increments stock + ledger | Operator+ |
| `POST` | `/operations/deliveries` | Create outbound delivery order draft | Operator+ |
| `POST` | `/operations/deliveries/{id}/validate` | Validate delivery $\rightarrow$ checks stock, decrements + ledger | Operator+ |
| `POST` | `/operations/transfers` | Execute paired internal transfer between two locations | Operator+ |
| `POST` | `/operations/adjustments` | Submit physical stocktake count with mandatory reason | Operator+ |
| `GET` | `/ledger` | Searchable append-only audit trail with filtering | Authenticated |

### Intelligence & Simulation Engine
| Method | Endpoint | Description | Auth / Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/intelligence/kpis` | Summary KPIs (Health, Stockouts, Capital At Risk) | Authenticated |
| `GET` | `/intelligence/forecasts/{sku}` | WMA demand forecast, cover days & confidence status | Authenticated |
| `GET` | `/intelligence/recommendations` | Ranked reorder & transfer suggestions | Authenticated |
| `POST` | `/scenarios/simulate` | **Read-only What If? scenario simulator** | Authenticated |
| `POST` | `/intelligence/copilot/query` | Grounded natural language query engine | Authenticated |

---

## 🎨 Design System, UX & Accessibility Standards

StockSense is crafted as an elite, high-density operational workspace inspired by modern data-intensive applications.

### Design Principles
* **Editorial Typographic Hierarchy:** Structured tabular typography using Inter and JetBrains Mono for SKUs, quantities, and timestamps.
* **Dual Theme Engine:** Native dark and light modes with seamless persistence in `localStorage` and automatic OS preference fallback (`prefers-color-scheme`).
* **Semantic Status Palette:**
  * 🟢 **Green (Emerald):** Healthy stock coverage ($> 14$ days cover).
  * 🟡 **Amber (Amber):** Warning / Low stock (within lead time window).
  * 🔴 **Red (Rose):** Critical stockout risk ($< 5$ days cover or stockout).
  * 🔵 **Blue (Sky):** Informational / Pending transfers and incoming receipts.
* **Multi-Channel Status Communication:** Information is **never** conveyed by color alone. Every status badge pairs color tokens with clear iconography (`AlertTriangle`, `CheckCircle2`, `Clock`) and explicit textual labels.

### Accessibility (WCAG 2.2 AA Compliance)
* **Keyboard Navigability:** Full keyboard tab-indexing across forms, interactive modals, scenario sliders, and pagination controls.
* **Visible Focus Indicators:** High-contrast focus rings (`focus-visible:ring-2 focus-visible:ring-primary`).
* **Screen Reader Support:** Accessible ARIA attributes (`aria-expanded`, `aria-describedby`, `role="status"` for live feedback notifications).
* **Accessible Visualizations:** All charts include screen-reader-accessible fallback data tables and informative SVG `aria-label` tags.
* **Responsive Viewport Safety:** Fully responsive layouts tested down to **320px** viewport width. Tables reflow into structured card layouts on mobile, preventing page-level horizontal overflow.

---

## 🎬 Repeatable Demo Dataset & 3-Minute Judging Storyboard

StockSense includes an automated seeding pipeline that generates **35 realistic products** across 3 warehouses with 90 days of synthetic historical movements.

### The 3-Minute Judging Walkthrough

```
[00:00 - 00:30] EXECUTIVE OVERVIEW
1. Log in as 'manager@stocksense.io'.
2. Land on Dashboard: Notice top KPIs: Total Valuation, 3 Critical Stockout Items, 2 Pending Deliveries.
3. Observe "Top Stockout Risks" card highlighting "Steel Rods" (SKU-STL-101).

[00:30 - 01:15] INSPECTING THE RISK (AI PRODUCT PROFILE)
4. Click on "Steel Rods":
   - Current On-Hand: 85 Units at Main Warehouse.
   - 30-Day Historical Velocity: ~14 Units / Day.
   - Estimated Cover: ~6 Days remaining.
   - Supplier Lead Time: 10 Days (Stockout predicted in 6 days < 10 days lead time!).
   - Criticality: High (Production critical).

[01:15 - 02:00] THE "WHAT IF? DECISION LAB"
5. Click "Test in What If? Lab":
   - Baseline shows stock reaching 0 in 6 days.
   - Option A (Reorder): Supplier delivery will arrive in 10 days -> 4 days of stockout window!
   - Option B (Internal Transfer): Warehouse B has 180 units with only 2 units/day demand.
   - Simulate transferring 40 units from Warehouse B -> Main Warehouse.
   - Sandbox confirms: Main Warehouse cover extends to 9 days; Warehouse B remains healthy with 70 days cover.

[02:00 - 02:40] HUMAN-IN-THE-LOOP EXECUTION
6. Click "Execute Transfer via Operations":
   - Pre-fills validated transfer form: Source (Warehouse B), Dest (Main Warehouse), Qty (40).
   - Click "Confirm & Validate Transfer".

[02:40 - 03:00] VERIFYING THE RESULT (INVARIANT AUDIT)
7. Navigate to Stock Ledger:
   - Verify paired entries: TRANSFER_OUT (-40) and TRANSFER_IN (+40) sharing Transfer ID.
   - Verify company-wide net stock unchanged.
   - Return to Dashboard: Steel Rods risk priority downgraded from Critical to Amber; zero full-page reload needed!
>>>>>>> ffc716af128c832adf421153e918bf586e44f43a
```

---

<<<<<<< HEAD
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
=======
## 🛠️ Installation, Configuration & Quickstart

### Prerequisites
* **Node.js:** v18.0+ & `npm` / `pnpm`
* **Python:** v3.11+
* **PostgreSQL:** v15+ (or Docker)

### 1. Environment Configuration
Create `.env` in the backend directory based on the following template:

```env
# --- Application Configuration ---
PROJECT_NAME="StockSense"
ENVIRONMENT="development"
DEBUG=True
API_V1_STR="/api/v1"
SECRET_KEY="temporary-hackathon-insecure-secret-key-change-in-production"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# --- Database Connection (PostgreSQL) ---
DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/stocksense_db"

# --- Optional AI Copilot ---
OPENAI_API_KEY=""  # Optional: Core system runs 100% deterministically without API key
```

### 2. Backend Setup & Database Migration
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
>>>>>>> ffc716af128c832adf421153e918bf586e44f43a

# Install dependencies
pip install -r requirements.txt

<<<<<<< HEAD
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
=======
# Run Alembic migrations to apply relational schema
alembic upgrade head

# Seed reproducible hackathon demo dataset
python -m scripts.seed_demo_data

# Launch FastAPI development server
uvicorn app.main:app --reload --port 8000
```
Backend API will be accessible at: `http://localhost:8000`  
Interactive Swagger docs: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend application will be accessible at: `http://localhost:5173`

### 4. Running with Docker Compose (One-Command Launch)
```bash
# Build and launch PostgreSQL, Backend API, and Frontend Client
docker compose up --build
>>>>>>> ffc716af128c832adf421153e918bf586e44f43a
```

---

<<<<<<< HEAD
## 🛡️ Security, Privacy & Integrity
- **Secrets Isolation**: All credentials, JWT keys, and API tokens are loaded via environment variables and excluded from source control.
- **GDPR & Privacy Compliance**: Includes a live Privacy Policy page with an interactive GDPR deletion request form and cookie consent banner.
- **Audit Trails**: Every inventory modification logs user ID, timestamp, source/destination locations, and linked transaction references.

---

## 📄 License
This project is developed for hackathon demonstration under the MIT License.
=======
## 🧪 Verification, Testing & Invariant Acceptance Criteria

StockSense enforces automated validation of domain invariants across both backend and frontend layers.

```bash
# Run backend test suite (invariants, transactions, RLS, forecasting math)
pytest -v --cov=app

# Run frontend unit tests and type checks
npm run test:run
npm run type-check
```

### Invariant Test Matrix

| Invariant | Test Target | Verification Check |
| :--- | :--- | :--- |
| **Transfer Balance Conservation** | `test_transfer_conservation` | Verifies $\sum \Delta \text{Stock} = 0$ across paired `TRANSFER_OUT` / `TRANSFER_IN` movements. |
| **Deficit Outbound Blocking** | `test_delivery_insufficient_stock` | Ensures delivery of $N > \text{Available}$ aborts with zero partial mutations. |
| **Atomic Transaction Rollback** | `test_atomic_rollback` | Simulates database failure during receipt item writing; asserts 0 stock changes. |
| **Simulation Zero-Mutation** | `test_simulation_side_effects` | Confirms `/scenarios/simulate` issues zero writes and ledger remains identical before & after. |
| **Cross-Tenant Isolation** | `test_tenant_rls_denial` | Verifies Organization B receives 404/403 when requesting Organization A records. |
| **Deterministic Demand Math** | `test_wma_forecast_math` | Verifies WMA calculations match hand-computed test fixtures within $10^{-4}$ precision. |
| **Insufficient Data Fallback** | `test_insufficient_history_flag` | Verifies SKU with $<5$ data points explicitly returns `insufficient_data: true`. |

---

## 📁 Project Directory Layout

```
stocksense/
├── .github/workflows/          # CI/CD automated linting & test pipelines
├── backend/
│   ├── alembic/                # Database migration environment & versions
│   │   └── versions/           # Versioned migration scripts
│   ├── app/
│   │   ├── api/                # REST route controllers (/auth, /inventory, /scenarios)
│   │   ├── core/               # App configuration, security & JWT utilities
│   │   ├── db/                 # Database session managers & base models
│   │   ├── models/             # SQLAlchemy ORM relational models
│   │   ├── schemas/            # Pydantic v2 validation contracts
│   │   ├── services/           # Domain logic (Stock, Ledger, Transfers, Forecasts)
│   │   └── main.py             # FastAPI application entry point
│   ├── scripts/
│   │   └── seed_demo_data.py   # Deterministic demo dataset seeder
│   ├── tests/                  # Pytest test suite (unit, integration & invariants)
│   ├── requirements.txt        # Backend dependencies
│   └── alembic.ini             # Alembic configuration
├── frontend/
│   ├── public/                 # Static assets, icons & manifest
│   ├── src/
│   │   ├── components/         # Reusable UI widgets (cards, tables, badges, modals)
│   │   ├── context/            # Auth & Theme context providers
│   │   ├── hooks/              # Custom React hooks (useInventory, useForecast)
│   │   ├── layouts/            # Dashboard layout, sidebar & navigation
│   │   ├── pages/              # Primary views (Dashboard, Operations, What-If, Ledger)
│   │   ├── services/           # Axios / Fetch API client integrations
│   │   ├── types/              # TypeScript interface definitions
│   │   ├── App.tsx             # Root router configuration
│   │   └── main.tsx            # React application entry point
│   ├── index.html              # HTML shell with viewport & SEO meta
│   ├── package.json            # Node.js dependencies & scripts
│   ├── tailwind.config.js      # Tailwind CSS design tokens
│   └── tsconfig.json           # TypeScript configuration
├── docker-compose.yml          # Containerized multi-service deployment
├── LICENSE                     # MIT License
└── README.md                   # System documentation & product specification
```

---

## 🔒 Security, Privacy & Row-Level Isolation

* **Defense in Depth:** Security is enforced at both the API routing layer (JWT verification and tenant scope injection) and the database persistence layer.
* **Row-Level Security (RLS):** Every tenant-owned table (`products`, `stock_levels`, `stock_ledger`) is bounded by `org_id`. Cross-tenant queries are blocked at the PostgreSQL engine level.
* **Audit Trail Integrity:** The `stock_ledger` table is strictly append-only. No `UPDATE` or `DELETE` permissions are granted on ledger records to standard application roles.
* **Credential Hygiene:** Passwords are encrypted using salted `bcrypt` hashes. API keys and secrets are loaded exclusively through environment variables; no secrets are committed to version control.
* **Privacy & Data Governance:** Includes an auditable data-deletion request endpoint (`POST /api/v1/privacy/deletion-request`). Historical stock movement history is anonymized or retained under legal compliance baselines without breaking ledger referential integrity.

---

## 🚫 Non-Goals & Honest Boundaries

To ensure absolute reliability and transparency during hackathon evaluation, StockSense explicitly delineates what is in scope versus out of scope:

* **No Autonomous Writes:** AI copilot queries and simulation models **never** perform direct database writes or execute purchase orders autonomously.
* **No Black-Box Probabilities:** StockSense does not claim "100% mathematically certain demand" or guarantee zero stockouts. All projections are labeled as statistical estimates.
* **No Fake Hardware Integration:** RFID/barcode hardware scanner integrations and IoT scale sensors are out of scope for the MVP.
* **No Accounting/Invoicing Bloat:** Focus is strictly dedicated to operational inventory excellence and predictive rebalancing rather than full-scale accounts payable/receivable ERP ledgering.

---

## 🗺️ Hackathon Roadmap (P0 / P1 / P2)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DEVELOPMENT ROADMAP                             │
├────────────────────────────────────────────────────────────────────────┤
│  [P0] CORE MVP (COMPLETED)                                             │
│  ✓ PostgreSQL ACID Relational Schema & Alembic Migrations              │
│  ✓ Receipts, Deliveries, Paired Transfers & Adjustments                │
│  ✓ Append-Only Immutable Stock Ledger                                  │
│  ✓ Deterministic WMA Forecasting & Stockout Days Calculation           │
│  ✓ "What If? Decision Lab" Read-Only Simulation Engine                 │
│  ✓ Responsive UI with Light / Dark Theme & WCAG 2.2 AA Compliance     │
├────────────────────────────────────────────────────────────────────────┤
│  [P1] ENHANCED DECISION CAPABILITIES (IN PROGRESS)                     │
│  • Grounded Natural Language Copilot with tool dispatching             │
│  • Supplier Lead-Time Volatility Tracking                              │
│  • Automated Alert Notification Rules & Email Webhooks                 │
├────────────────────────────────────────────────────────────────────────┤
│  [P2] ENTERPRISE EXTENSIONS (POST-HACKATHON)                           │
│  • Multi-region distributed warehouse clustering                       │
│  • Direct EDI / API supplier catalog integrations                      │
│  • Edge-compatible offline PWA mode for warehouse barcode scanners    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📄 License & Acknowledgments

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for complete details.

Built with dedication for the **Odoo Hackathon Challenge**, transforming inventory operations from reactive registers into intelligent, explainable, and proactive optimization engines.
>>>>>>> ffc716af128c832adf421153e918bf586e44f43a

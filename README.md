# MoneyMitra

An intelligent financial wellbeing platform built PS4-first — everything revolves around gig worker irregular income intelligence.

## Architecture

```
Next.js (Product Layer)
    ↕ Server Actions
Supabase PostgreSQL (Source of Truth)
    ↕ RLS enforced
Python FastAPI (PS4 Intelligence Layer)
    → Income analytics, distress prediction, intervention engine
```

## Project Structure

```
MoneyMitra/
├── apps/
│   └── web/                    # Next.js 15 App Router (TypeScript + Tailwind + shadcn)
│       ├── src/app/
│       │   ├── dashboard/      # Safe-to-Spend + Income Volatility score
│       │   ├── health/         # Financial Resilience Score + XAI Explainability
│       │   ├── money/          # Transactions + CSV Statement Importer
│       │   ├── planning/       # Dynamic gig-aware savings goals
│       │   ├── debt/           # Loans, EMI schedule, credit utilization
│       │   ├── insights/       # Intervention engine + 30-day cashflow forecast
│       │   ├── simulator/      # What-If scenario financial planner
│       │   ├── advisor/        # Financial Wellbeing Officer portal
│       │   └── onboarding/     # 4-step gig worker intake flow
│       ├── src/components/
│       │   └── Navigation.tsx  # App sidebar
│       └── src/app/actions.ts  # Next.js Server Actions → ML Service bridge
│
├── services/
│   └── ml/                     # Python FastAPI intelligence layer
│       ├── main.py             # API entry point (6 endpoints)
│       ├── analytics/
│       │   ├── income.py       # PS4: income volatility, CV, source concentration
│       │   └── cashflow.py     # PS4: safe-to-spend, 30/60/90d forecast ranges
│       ├── risk/
│       │   └── distress_model.py  # PS3: 30/60/90d distress probability + SHAP factors
│       └── recommendations/
│           └── intervention_engine.py  # Intervention ladder levels 1-5
│
└── supabase/
    ├── migrations/
    │   ├── 20260903000000_core_schema.sql      # Auth, profiles, income, transactions
    │   └── 20260903000001_complete_domain_model.sql  # Full 33-table domain model
    └── seed.sql                # Reference data + auth trigger
```

## Getting Started

### 1. Next.js Frontend

```bash
cd apps/web
npm install
npm run dev
# Opens at http://localhost:3000
```

### 2. Python ML Service (PS4 Intelligence Engine)

```bash
cd services/ml
python -m venv venv
.\venv\Scripts\Activate.ps1     # Windows
pip install -r requirements.txt
uvicorn main:app --reload
# API at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### 3. Apply Supabase Database Schema

In your Supabase project SQL editor, run every migration file in order:
1. `supabase/migrations/20260903000000_core_schema.sql`
2. `supabase/migrations/20260903000001_complete_domain_model.sql`
3. `supabase/migrations/20260903000002_auth_profile_trigger.sql`
4. `supabase/migrations/20260903000003_user_statements.sql`
5. `supabase/seed.sql`

Do not run only the latest migration: the `profiles` table is created by the core schema migration.

## Application Routes

| Route | Description |
|-------|-------------|
| `/onboarding` | 4-step gig worker intake flow |
| `/dashboard` | Safe-to-Spend + Income Volatility (PS4 Live ML) |
| `/health` | Financial Resilience Score + XAI Factor Analysis |
| `/money` | Transactions + CSV Statement Import |
| `/planning` | Dynamic Savings Goals (variable income-aware) |
| `/debt` | Loan EMI Tracker + Credit Utilization |
| `/insights` | Intervention Engine + Cashflow Forecast |
| `/simulator` | What-If Financial Scenario Planner |
| `/advisor` | Financial Wellbeing Officer Dashboard |

## Python ML Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /` | Health check |
| `POST /analytics/income-volatility` | PS4 income CV, trend, source concentration |
| `POST /analytics/safe-to-spend` | Gig-worker weekly safe-to-spend calculation |
| `POST /analytics/cashflow-forecast` | 30/60/90-day income range forecasting |
| `POST /risk/distress-prediction` | Financial distress probability + SHAP factors |
| `POST /interventions/recommendations` | Intervention ladder (Levels 1–5) |
| `POST /simulation/run` | What-if scenario simulation |

## Key Design Decisions

- **PS4 First**: Safe-to-spend adapts to irregular gig income — no fixed monthly targets
- **Supabase = Source of Truth**: ML reads and writes to the same Postgres DB
- **Graceful fallback**: All Server Actions include offline fallback calculations if Python ML service is down
- **RLS enforced at DB level**: Customers see only their data; advisors see only assigned customers
- **Intervention ladder**: Recommendations escalate from insight → warning → human advisor, never autonomous decisions
- **LLM = explanation only**: Natural language is generated from structured ML output, not used for financial decisions

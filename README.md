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

## Production Deployment

### Deploy the Next.js app to Vercel

1. Push this repository to GitHub and import it into Vercel.
2. Set the Vercel **Root Directory** to `apps/web`.
3. Keep the framework as **Next.js**. Vercel should detect:
   - Install command: `npm install`
   - Build command: `npm run build`
   - Output: `.next`
4. Add these Environment Variables in Vercel for **Production**, **Preview**, and **Development** as appropriate:

   ```text
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable/anon key>
   ML_SERVICE_URL=https://<your-deployed-ml-service>
   ```

   These two Supabase values are public browser configuration, not secrets, so the
   `NEXT_PUBLIC_` prefix is required by Next.js. The app also accepts the equivalent
   `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` names on the server. The app derives
   its OAuth callback origin from the Vercel request URL, so no custom domain or site
   URL variable is required. `ML_SERVICE_URL` is optional because the
   application has fallback calculations, but a deployed ML service enables the full
   analytics and distress-prediction models.
5. Deploy and test `/auth`, `/onboarding`, `/money`, `/dashboard`, `/health`, and `/advisor`.

### Deploy the Python ML service

Deploy `services/ml` to a Python host such as Render, Railway, Fly.io, or a similar service.
Use:

```text
Root directory: services/ml
Build command: pip install -r requirements.txt
Start command: uvicorn main:app --host 0.0.0.0 --port $PORT
Health check: GET /
```

Copy the HTTPS service URL into Vercel as `ML_SERVICE_URL`, then redeploy the web app.

### Connect a custom domain

In Vercel, open the project **Settings → Domains**, add your domain, and copy the DNS
records Vercel displays. Usually:

- Root domain (`example.com`): use the A record shown by Vercel.
- `www` subdomain: use the CNAME record shown by Vercel.

Remove conflicting old A/CNAME records at your registrar. Keep email-related MX/TXT
records unchanged. Wait for DNS propagation, then confirm that Vercel shows the domain
as **Valid** and HTTPS is enabled.

### Update Supabase URLs

### Officer login

Officers use the **Officer Login** link on the landing page or the regular `/auth`
page with `/advisor` as the destination. There is no separate password database.
After authentication, the `/advisor` route checks `organization_members`; only users
assigned the `advisor` or `admin` role by an existing administrator can enter.
Do not let officers assign their own role. An administrator must create the membership
in Supabase using the officer's authenticated user ID and the bank organization ID.
For example, after creating the officer account, an administrator can run:

```sql
INSERT INTO public.organization_members (organization_id, user_id, role)
VALUES ('<bank-organization-id>', '<officer-auth-user-id>', 'advisor');
```

In Supabase **Authentication → URL Configuration**:

- Site URL: `https://<your-domain>`
- Additional Redirect URLs:
  - `https://<your-domain>/auth/callback`
  - `https://*.vercel.app/auth/callback` (use a specific preview URL instead if preferred)

For Google authentication, the Google Cloud OAuth client must still contain:

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

The browser returns to MoneyMitra through `/auth/callback`; do not replace the Supabase
callback with the Vercel URL in Google Cloud.

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
5. `supabase/migrations/20260903000004_goal_rls.sql`
6. `supabase/migrations/20260903000005_loan_emi_fields.sql`
7. `supabase/migrations/20260903000006_bank_connection_consent.sql`
8. `supabase/migrations/20260903000007_officer_portfolio_access.sql`
9. `supabase/migrations/20260904000000_impact_wallet.sql`
10. `supabase/migrations/20260904000001_impact_evidence.sql`
11. `supabase/migrations/20260904000002_single_use_evidence.sql`
12. `supabase/migrations/20260904000003_blood_donation_activity.sql`
13. `supabase/seed.sql`

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

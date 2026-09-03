# MoneyMitra Feature Documentation

MoneyMitra is a financial wellbeing platform for people with irregular income, especially gig workers. It combines personal financial tracking, early-warning analytics, and human advisor support.

## 1. Product roles

### Customer

Customers can:

- Create an account with email/password or Google OAuth.
- Complete financial onboarding.
- Import bank or platform statements.
- View personal income, expenses, goals, debt, and financial insights.
- Run what-if cash-flow simulations.
- See recommendations based on their own saved data.

### Financial Wellbeing Officer

Officers can monitor assigned customer cases, risk trends, intervention status, and customer trajectories through the separate Officer Portal.

Officer access is intended for users with an organization membership role of:

- `advisor`
- `admin`

### Bank administrator

Administrators can manage organization memberships, risk policies, product configuration, model versions, and audit requirements. Administrative workflows are represented in the database model and can be expanded through the Officer Portal.

## 2. Authentication and account security

- Supabase Auth manages sessions and identities.
- Email/password sign-in and registration are supported.
- Google OAuth is supported when enabled in Supabase.
- Cookie-based SSR sessions are refreshed by middleware.
- Protected customer routes require an authenticated user.
- Each new Auth user receives a matching `profiles` row.
- Failed login attempts stay on the authentication page and show the actual error.
- Users can sign out and switch accounts.

## 3. Customer onboarding

The four-step onboarding flow collects:

1. Income type: gig, freelance, salaried, or small business.
2. Income frequency: daily, weekly, irregular, or monthly.
3. Primary financial goal: emergency buffer, debt reduction, stable cash flow, or goal savings.
4. Statement-import readiness.

On completion, the selections are saved to `financial_profiles` for the authenticated user.

## 4. Statement and transaction management

The Money page supports CSV imports using:

```csv
date,source,amount,direction,category
2026-09-01,Uber,2500,credit,Gig Income
2026-09-02,Indian Oil,450,debit,Fuel
```

Import behavior:

- Parses normalized CSV rows.
- Stores an import record in `statement_imports`.
- Stores transaction rows in `transactions`.
- Associates every row with the authenticated user.
- Reloads the user’s transaction list after import.
- Calculates income, expenses, and essential outflow from saved rows.

Required CSV fields:

- `date`: `YYYY-MM-DD`
- `source`
- `amount`: positive number
- `direction`: `credit` or `debit`
- `category`

## 5. Financial goals

The Planning page supports user-owned savings goals.

Each goal contains:

- Name
- Target amount
- Current saved amount
- Target date
- Priority
- Status

Goals are stored in `savings_goals`. Progress is calculated as:

```text
current_amount / target_amount * 100
```

Users can create goals from the Planning page. Row Level Security ensures users can only manage their own goals.

## 6. Debt and EMI tracking

The Debt page supports user-owned loans and EMI schedules.

Each loan can include:

- Lender
- Loan type
- Outstanding principal
- EMI amount
- Next due date
- Status

Creating a loan also creates its first `loan_payments` schedule row. The page calculates live outstanding debt and scheduled EMI totals from Supabase.

## 7. Personalized insights

The customer Insights page reads the signed-in user’s transactions and calculates:

- Total recorded income
- Total recorded expenses
- Detected essential outflow
- Net recorded cash flow
- Income volatility
- Personalized guidance

Recommendation examples:

- No data: import a statement.
- Negative cash flow: protect essential payments and reduce discretionary spending.
- High volatility: maintain a larger buffer and save more on strong earning days.
- Positive cash flow: prioritize emergency savings.

The page clearly identifies itself as the Customer view and does not show officer case data.

## 8. Financial analytics engine

The Python FastAPI service provides:

| Endpoint | Purpose |
|---|---|
| `GET /` | Service health check |
| `POST /analytics/income-volatility` | Income stability, CV, trend, and source concentration |
| `POST /analytics/safe-to-spend` | Conservative safe-to-spend calculation |
| `POST /analytics/cashflow-forecast` | 30/60/90-day forecast ranges |
| `POST /risk/distress-prediction` | Distress probability and risk factors |
| `POST /interventions/recommendations` | Intervention ladder recommendations |
| `POST /simulation/run` | What-if income and expense simulation |

The web app includes fallback calculations for selected analytics if the ML service is unavailable.

## 9. Safe-to-Spend calculation

The service estimates:

```text
conservative income = minimum expected income + 25% of expected range
safety buffer = daily essential expense * target buffer days
safe-to-spend = balance + conservative income
                - essential expenses
                - debt obligations
                - safety buffer
```

The result is never negative and includes a weekly spending slice.

## 10. What-if simulator

Customers can change:

- Monthly income percentage
- Essential expense percentage

The simulator returns:

- Projected income
- Projected expenses
- Projected net cash flow
- Emergency buffer days
- Distress risk probability
- Risk status

## 11. Officer Portal

The Officer Portal is separate from customer insights and is intended for authorized bank staff.

It supports the display of:

- Monitored customer portfolio
- High-risk cases
- Warning watchlist
- Stable trajectories
- Customer buffer days
- Income volatility
- Intervention status

Unauthorized users see an access message and cannot view the officer dashboard.

## 12. Database and privacy

Supabase PostgreSQL is the source of truth.

Important tables include:

- `profiles`
- `organization_members`
- `financial_profiles`
- `financial_accounts`
- `income_sources`
- `income_records`
- `transactions`
- `statement_imports`
- `savings_goals`
- `loans`
- `loan_payments`
- `financial_features`
- `risk_predictions`
- `recommendations`
- `interventions`
- `simulations`

Customer-owned tables use policies based on:

```sql
auth.uid() = user_id
```

This prevents one customer from reading or modifying another customer’s financial records.

## 13. Application routes

| Route | Description |
|---|---|
| `/` | Product landing page |
| `/auth` | Sign in, sign up, and Google authentication |
| `/onboarding` | Four-step customer setup |
| `/dashboard` | Safe-to-Spend and income stability |
| `/health` | Resilience score and risk explanation |
| `/money` | Transactions and CSV statement import |
| `/planning` | Savings goals |
| `/debt` | Loans and EMI schedules |
| `/insights` | Personalized customer recommendations |
| `/simulator` | What-if financial planning |
| `/advisor` | Authorized Officer Portal |

## 14. Local development

Start the ML service:

```powershell
cd D:\PROJECTS\MoneyMitra\services\ml
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --port 8000
```

Start the web app in a second terminal:

```powershell
cd D:\PROJECTS\MoneyMitra\apps\web
npm run dev
```

Open:

```text
http://localhost:3000
```

## 15. Supabase setup

Run migrations in order in the Supabase SQL Editor:

1. `20260903000000_core_schema.sql`
2. `20260903000001_complete_domain_model.sql`
3. `20260903000002_auth_profile_trigger.sql`
4. `20260903000003_user_statements.sql`
5. `20260903000004_goal_rls.sql`
6. `20260903000005_loan_emi_fields.sql`
7. `seed.sql`

The migrations are designed to be safely rerun where possible.

## 16. Google authentication setup

In Supabase:

1. Open **Authentication → Providers → Google**.
2. Enable Google.
3. Add Google Client ID and Client Secret.
4. Add `http://localhost:3000/auth/callback` to the allowed redirect URLs.

In Google Cloud Console, add:

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

Google authentication cannot work until the provider is enabled in Supabase.

## 17. Validation

Existing validation commands:

```powershell
cd D:\PROJECTS\MoneyMitra\apps\web
npm run lint
npm run build
```

The Python service can be checked with:

```powershell
cd D:\PROJECTS\MoneyMitra\services\ml
python -m compileall -q . -x "venv"
```


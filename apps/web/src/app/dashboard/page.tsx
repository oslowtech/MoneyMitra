import { Navigation } from "@/components/Navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, AlertTriangleIcon, CheckCircle2Icon } from "lucide-react";
import { fetchIncomeVolatility, fetchSafeToSpend } from "../actions";

export const dynamic = "force-dynamic";

// Mock Gig Worker Income Data
const MOCK_INCOME_RECORDS = [
  { amount: 2000, date: "2026-08-01", source: "Uber" },
  { amount: 800, date: "2026-08-02", source: "Swiggy" },
  { amount: 2500, date: "2026-08-03", source: "Uber" },
  { amount: 500, date: "2026-08-05", source: "Swiggy" },
  { amount: 1800, date: "2026-08-07", source: "Uber" },
  { amount: 1200, date: "2026-08-10", source: "Swiggy" },
  { amount: 3100, date: "2026-08-15", source: "Freelance" },
  { amount: 1500, date: "2026-08-20", source: "Uber" },
];

export default async function DashboardPage() {
  const [mlResult, safeToSpend] = await Promise.all([
    fetchIncomeVolatility(MOCK_INCOME_RECORDS),
    fetchSafeToSpend({
      current_balance: 8000,
      expected_income_min: 3500,
      expected_income_max: 5200,
      essential_expenses: 5000,
      upcoming_debt_obligations: 3000,
    }),
  ]);
  const cv = mlResult?.coefficient_of_variation ?? mlResult?.volatility ?? 0.45;
  const cvPercentage = (cv * 100).toFixed(1);
  const weeklySafeToSpend = safeToSpend?.safe_to_spend_weekly ?? 0;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="flex-1 p-8 max-w-6xl mx-auto space-y-8 overflow-y-auto">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Good afternoon, Ravi. Here is your financial trajectory.</p>
          </div>
          <div className="flex items-center space-x-4">
            <a href="/money" className={buttonVariants({ variant: "outline", className: "rounded-full" })}>Add Income</a>
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">R</div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SAFE TO SPEND CARD */}
          <Card className="col-span-1 md:col-span-2 border-primary/50 shadow-lg shadow-primary/10 bg-card/60">
            <CardHeader>
              <CardTitle className="text-primary flex items-center space-x-2">
                <CheckCircle2Icon className="h-5 w-5" />
                <span>SAFE TO SPEND</span>
              </CardTitle>
              <CardDescription>Based on expected income and upcoming obligations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-black mb-4">₹{Math.round(weeklySafeToSpend).toLocaleString("en-IN")} <span className="text-xl text-muted-foreground font-normal">this week</span></div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between"><span>Current balance</span> <span className="text-foreground">₹8,000</span></div>
                <div className="flex justify-between"><span>Expected income</span> <span className="text-green-500">+ ₹4,200</span></div>
                <div className="flex justify-between"><span>Essential expenses</span> <span className="text-red-500">- ₹5,000</span></div>
                <div className="flex justify-between"><span>Upcoming EMI</span> <span className="text-red-500">- ₹3,000</span></div>
                <div className="flex justify-between font-medium pt-2 border-t border-border"><span>Safety buffer</span> <span className="text-primary">- ₹{Math.round(safeToSpend?.safety_buffer_reserved ?? 0).toLocaleString("en-IN")}</span></div>
              </div>
            </CardContent>
          </Card>

          {/* FINANCIAL HEALTH CARD */}
          <Card className="bg-card/60">
            <CardHeader>
              <CardTitle>Financial Resilience</CardTitle>
              <CardDescription>Your PS4 Health Score</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="text-6xl font-black text-primary mb-2">64</div>
              <div className="text-sm font-medium bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full flex items-center space-x-1">
                <AlertTriangleIcon className="h-4 w-4" />
                <span>MODERATE</span>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Your score is down 8 points due to increased income volatility.
              </p>
            </CardContent>
          </Card>

          {/* INCOME STABILITY (GIG FOCUS) */}
          <Card className="col-span-1 md:col-span-3 bg-card/60">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Income Stability</span>
                <span className="text-sm font-normal bg-secondary px-3 py-1 rounded-full">
                  ML Volatility Score: <span className="font-bold text-primary">{cvPercentage}%</span>
                </span>
              </CardTitle>
              <CardDescription>Your income varies significantly week to week.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Uber</div>
                  <div className="text-2xl font-bold">₹7,800</div>
                  <div className="text-xs text-red-500 flex items-center mt-1"><ArrowDownIcon className="h-3 w-3 mr-1"/> 14% vs avg</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Swiggy</div>
                  <div className="text-2xl font-bold">₹2,500</div>
                  <div className="text-xs text-green-500 flex items-center mt-1"><ArrowUpIcon className="h-3 w-3 mr-1"/> 5% vs avg</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Freelance</div>
                  <div className="text-2xl font-bold">₹3,100</div>
                  <div className="text-xs text-muted-foreground flex items-center mt-1">Stable</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

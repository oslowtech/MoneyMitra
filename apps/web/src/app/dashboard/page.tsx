import { Navigation } from "@/components/Navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangleIcon, CheckCircle2Icon } from "lucide-react";
import { fetchIncomeVolatility, fetchSafeToSpend } from "../actions";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
    : { data: null };
  const { data: transactions } = await supabase
    .from("transactions")
    .select("transaction_date, source, amount, direction, description")
    .order("transaction_date", { ascending: false })
    .limit(200);
  const { data: loans } = await supabase.from("loans").select("outstanding_principal, next_emi_amount");
  const rows = transactions || [];
  const incomeRecords = rows.filter((row) => row.direction === "credit").map((row) => ({
    amount: Number(row.amount), date: row.transaction_date, source: row.source || "Other",
  }));
  const incomeTotal = incomeRecords.reduce((sum, row) => sum + row.amount, 0);
  const expenseRows = rows.filter((row) => row.direction === "debit");
  const expenseTotal = expenseRows.reduce((sum, row) => sum + Number(row.amount), 0);
  const essentialExpenses = expenseRows.reduce((sum, row) =>
    /rent|fuel|utility|electric|grocery|medical|emi|loan/i.test(`${row.description} ${row.source}`)
      ? sum + Number(row.amount) : sum, 0);
  const currentBalance = incomeTotal - expenseTotal;
  const loanTotal = (loans || []).reduce((sum, loan) => sum + Number(loan.next_emi_amount || 0), 0);
  const sourceTotals = incomeRecords.reduce<Record<string, number>>((totals, row) => {
    totals[row.source] = (totals[row.source] || 0) + row.amount;
    return totals;
  }, {});
  const [mlResult, safeToSpend] = await Promise.all([
    fetchIncomeVolatility(incomeRecords),
    fetchSafeToSpend({
      current_balance: currentBalance,
      expected_income_min: incomeTotal * 0.75,
      expected_income_max: incomeTotal * 1.25,
      essential_expenses: essentialExpenses,
      upcoming_debt_obligations: loanTotal,
    }),
  ]);
  const cv = mlResult?.coefficient_of_variation ?? mlResult?.volatility ?? 0.45;
  const cvPercentage = (cv * 100).toFixed(1);
  const weeklySafeToSpend = safeToSpend?.safe_to_spend_weekly ?? 0;
  const stabilityScore = mlResult?.income_stability_score ?? 50;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="flex-1 p-8 max-w-6xl mx-auto space-y-8 overflow-y-auto">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Good afternoon, {profile?.full_name || user?.email?.split("@")[0] || "there"}. Here is your financial trajectory.</p>
          </div>
          <div className="flex items-center space-x-4">
            <a href="/money" className={buttonVariants({ variant: "outline", className: "rounded-full" })}>Add Income</a>
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {(profile?.full_name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
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
                <div className="flex justify-between"><span>Current balance</span> <span className="text-foreground">₹{Math.round(currentBalance).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span>Recorded income</span> <span className="text-green-500">+ ₹{Math.round(incomeTotal).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span>Essential expenses</span> <span className="text-red-500">- ₹{Math.round(essentialExpenses).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span>Upcoming EMI</span> <span className="text-red-500">- ₹{Math.round(loanTotal).toLocaleString("en-IN")}</span></div>
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
              <div className="text-6xl font-black text-primary mb-2">{stabilityScore}</div>
              <div className="text-sm font-medium bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full flex items-center space-x-1">
                <AlertTriangleIcon className="h-4 w-4" />
                <span>MODERATE</span>
              </div>
               <p className="text-center text-xs text-muted-foreground mt-4">
                Based on {rows.length} imported transaction{rows.length === 1 ? "" : "s"}.
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
                {Object.entries(sourceTotals).slice(0, 3).map(([source, total]) => (
                  <div key={source}>
                    <div className="text-sm text-muted-foreground mb-1">{source}</div>
                    <div className="text-2xl font-bold">₹{Math.round(total).toLocaleString("en-IN")}</div>
                    <div className="text-xs text-muted-foreground mt-1">{(total / (incomeTotal || 1) * 100).toFixed(0)}% of recorded income</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

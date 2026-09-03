import { Navigation } from "@/components/Navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangleIcon, CheckCircle2Icon } from "lucide-react";
import { fetchIncomeVolatility, fetchSafeToSpend } from "../actions";
import { createClient } from "@/utils/supabase/server";
import { logImpactActivity } from "./impact-actions";

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
  const { data: wallet } = await supabase.from("impact_wallets").select("health_credit_balance, green_credit_balance, total_impact_score").eq("user_id", user?.id || "").maybeSingle();
  const { data: activityRules } = await supabase.from("impact_activity_rules").select("id, activity_name, credit_type, base_credits, impact_multiplier, verification_multiplier, monthly_cap").eq("active", true).order("activity_name");
  const { data: impactHistory } = await supabase.from("impact_transactions").select("credits, financial_benefit_estimate").eq("user_id", user?.id || "").gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()).in("transaction_type", ["EARN", "BONUS"]);
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
  const healthCredits = Number(wallet?.health_credit_balance || 0);
  const greenCredits = Number(wallet?.green_credit_balance || 0);
  const monthlyImpactCredits = (impactHistory || []).reduce((sum, entry) => sum + Number(entry.credits), 0);
  const monthlyBenefit = (impactHistory || []).reduce((sum, entry) => sum + Number(entry.financial_benefit_estimate || 0), 0);

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

          <Card className="col-span-1 md:col-span-3 border-primary/30 bg-card/60">
            <CardHeader>
              <CardTitle>Impact Credit Wallet</CardTitle>
              <CardDescription>Reward healthy and sustainable actions. Credits are separate and do not affect your financial-health score.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl bg-primary/10 p-4"><p className="text-sm text-muted-foreground">Health Credits</p><p className="text-3xl font-black text-primary">{healthCredits}</p></div>
                <div className="rounded-xl bg-green-500/10 p-4"><p className="text-sm text-muted-foreground">Green Credits</p><p className="text-3xl font-black text-green-400">{greenCredits}</p></div>
                <div className="rounded-xl bg-secondary p-4"><p className="text-sm text-muted-foreground">Impact Score</p><p className="text-3xl font-black">{healthCredits + greenCredits}</p></div>
                <div className="rounded-xl bg-secondary p-4"><p className="text-sm text-muted-foreground">This month</p><p className="text-3xl font-black">+{monthlyImpactCredits}</p><p className="text-xs text-muted-foreground">₹{Math.round(monthlyBenefit)} estimated benefit</p></div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Log an eligible activity</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {(activityRules || []).map((rule) => <form key={rule.id} action={logImpactActivity} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                    <input type="hidden" name="activityId" value={rule.id} />
                    <div><p className="font-medium">{rule.activity_name}</p><p className="text-xs text-muted-foreground">{rule.credit_type === "HEALTH" ? "🩺 Health" : "🌱 Green"} · up to {rule.monthly_cap}/month</p></div>
                    <div className="flex items-center gap-2"><select name="verificationLevel" defaultValue="0" className="rounded border border-input bg-background px-2 py-1 text-xs"><option value="0">Self-report</option><option value="1">Evidence</option><option value="2">Auto verified</option><option value="3">Partner verified</option></select><Button type="submit" size="sm">Log +{Math.floor(Number(rule.base_credits) * Number(rule.impact_multiplier) * Number(rule.verification_multiplier))}</Button></div>
                  </form>)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

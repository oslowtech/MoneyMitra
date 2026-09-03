import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { fetchIncomeVolatility } from "../actions";

export const dynamic = "force-dynamic";

const money = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: transactions } = await supabase
    .from("transactions")
    .select("transaction_date, source, amount, direction, description")
    .order("transaction_date", { ascending: false })
    .limit(200);

  const rows = transactions || [];
  const income = rows.filter((row) => row.direction === "credit");
  const expenses = rows.filter((row) => row.direction === "debit");
  const incomeTotal = income.reduce((sum, row) => sum + Number(row.amount), 0);
  const expenseTotal = expenses.reduce((sum, row) => sum + Number(row.amount), 0);
  const essentialTotal = expenses.reduce((sum, row) =>
    /rent|fuel|utility|electric|grocery|medical|emi|loan/i.test(`${row.description} ${row.source}`)
      ? sum + Number(row.amount)
      : sum, 0);
  const incomeResult = await fetchIncomeVolatility(income.map((row) => ({
    amount: Number(row.amount),
    date: row.transaction_date,
    source: row.source || "Other",
  })));
  const volatility = Number(incomeResult?.coefficient_of_variation || 0);
  const net = incomeTotal - expenseTotal;
  const hasData = rows.length > 0;
  const recommendation = !hasData
    ? "Import a bank or platform statement to receive personalized guidance."
    : net < 0
      ? `Your recorded outflow is ${money(Math.abs(net))} higher than income. Pause discretionary spending and protect your next essential payment.`
      : volatility > 0.5
        ? "Your income is fluctuating sharply. Keep a larger cash buffer and move money to savings on stronger earning days."
        : "Your recent cash flow is positive. Build your emergency buffer before increasing discretionary spending.";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="flex-1 p-8 max-w-6xl mx-auto space-y-8 overflow-y-auto">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Insights & Interventions</h1>
            <p className="text-muted-foreground">Personalized guidance based on your saved transactions and income pattern.</p>
          </div>
          <span className="bg-primary/10 border border-primary/30 text-primary font-mono text-xs px-3 py-1.5 rounded-full font-bold">
            Customer view
          </span>
        </header>

        <Card className={net < 0 ? "border-red-500/50 bg-red-500/5" : "border-primary/50 bg-primary/5"}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-primary bg-primary/20 px-3 py-1 rounded-full uppercase tracking-wider">Personalized today</span>
              <span className="text-xs text-muted-foreground font-mono">{user?.email}</span>
            </div>
            <CardTitle className="text-2xl mt-2">{recommendation}</CardTitle>
            <CardDescription>Generated from {rows.length} transaction{rows.length === 1 ? "" : "s"} in your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/money" className="text-sm font-semibold text-primary hover:underline">Review your transactions →</Link>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/60"><CardHeader><CardDescription>Your income</CardDescription><CardTitle className="text-2xl">{money(incomeTotal)}</CardTitle></CardHeader><CardContent className="text-xs text-muted-foreground">Saved credits</CardContent></Card>
          <Card className="bg-card/60"><CardHeader><CardDescription>Your expenses</CardDescription><CardTitle className="text-2xl">{money(expenseTotal)}</CardTitle></CardHeader><CardContent className="text-xs text-muted-foreground">Saved debits</CardContent></Card>
          <Card className="bg-card/60"><CardHeader><CardDescription>Essential outflow</CardDescription><CardTitle className="text-2xl">{money(essentialTotal)}</CardTitle></CardHeader><CardContent className="text-xs text-muted-foreground">Detected from descriptions</CardContent></Card>
          <Card className="bg-card/60"><CardHeader><CardDescription>Income volatility</CardDescription><CardTitle className="text-2xl">{(volatility * 100).toFixed(1)}%</CardTitle></CardHeader><CardContent className="text-xs text-muted-foreground">Calculated for you</CardContent></Card>
        </div>

        <Card className="border-border bg-card/60">
          <CardHeader><CardTitle className="flex items-center space-x-2"><TrendingUp className="h-5 w-5 text-primary" /><span>Your cash-flow signal</span></CardTitle><CardDescription>This view is based only on your authenticated account data.</CardDescription></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50 border border-border"><span className="text-xs text-muted-foreground uppercase">Net recorded cash flow</span><div className={`text-2xl font-black mt-1 ${net < 0 ? "text-red-400" : "text-primary"}`}>{money(net)}</div></div>
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-start space-x-3"><ShieldCheck className="h-5 w-5 text-primary mt-0.5" /><p className="text-sm text-muted-foreground">MoneyMitra does not make autonomous financial decisions. Use these signals to decide your next action.</p></div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

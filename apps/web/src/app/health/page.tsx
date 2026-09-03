import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangleIcon, InfoIcon, TrendingDownIcon } from "lucide-react";
import { fetchDistressPrediction, fetchIncomeVolatility } from "../actions";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

interface RiskFactor {
  feature_name: string;
  feature_value: string;
  impact: string;
  rank: number;
}

export default async function HealthPage() {
  const supabase = await createClient();
  const { data: transactions } = await supabase.from("transactions").select("transaction_date, source, amount, direction, description").order("transaction_date", { ascending: false }).limit(200);
  const { data: loans } = await supabase.from("loans").select("next_emi_amount");
  const rows = transactions || [];
  const income = rows.filter((row) => row.direction === "credit");
  const expenses = rows.filter((row) => row.direction === "debit");
  const incomeTotal = income.reduce((sum, row) => sum + Number(row.amount), 0);
  const expenseTotal = expenses.reduce((sum, row) => sum + Number(row.amount), 0);
  const essentialTotal = expenses.reduce((sum, row) => /rent|fuel|utility|electric|grocery|medical|emi|loan/i.test(`${row.description} ${row.source}`) ? sum + Number(row.amount) : sum, 0);
  const incomeResult = await fetchIncomeVolatility(income.map((row) => ({ amount: Number(row.amount), date: row.transaction_date, source: row.source || "Other" })));
  const volatility = Number(incomeResult?.coefficient_of_variation || 0);
  const monthlyIncome = incomeTotal || 1;
  const debt = (loans || []).reduce((sum, loan) => sum + Number(loan.next_emi_amount || 0), 0);
  const bufferDays = essentialTotal > 0 ? Math.max(0, Math.round(Math.max(0, incomeTotal - expenseTotal) / (essentialTotal / 30))) : 0;
  const midpoint = Math.ceil(income.length / 2);
  const recentIncome = income.slice(0, midpoint).reduce((sum, row) => sum + Number(row.amount), 0);
  const olderIncome = income.slice(midpoint).reduce((sum, row) => sum + Number(row.amount), 0);
  const incomeTrend = olderIncome ? (recentIncome - olderIncome) / olderIncome : 0;
  const prediction = await fetchDistressPrediction({ income_trend: incomeTrend, savings_buffer_days: bufferDays, debt_to_income: debt / monthlyIncome, income_volatility: volatility, essential_expense_ratio: essentialTotal / monthlyIncome });
  const risk = prediction.horizon_predictions?.["90_day_risk"] ?? 0;
  const score = rows.length ? Math.max(0, Math.min(100, Math.round(100 - risk * 70))) : 0;
  const level = rows.length ? (score >= 70 ? "HEALTHY" : score >= 50 ? "MODERATE" : "AT RISK") : "NO DATA";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="flex-1 min-w-0 p-4 pt-16 sm:p-8 sm:pt-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 overflow-y-auto">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Health</h1>
            <p className="text-muted-foreground">Comprehensive resilience analysis & trajectory intelligence.</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
            <AlertTriangleIcon className="h-4 w-4" />
            <span>Overall Risk: {prediction.overall_risk_level}</span>
          </div>
        </header>

        {/* HEALTH SCORE HERO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 border-primary/40 bg-card/60 flex flex-col justify-center items-center p-6 text-center">
            <span className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-2">Resilience Score</span>
            <div className="text-7xl font-black text-primary mb-2">{score}<span className="text-2xl text-muted-foreground font-normal">/100</span></div>
            <div className="text-sm font-bold text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full mb-4">
              {level} RESILIENCE
            </div>
            <p className="text-xs text-muted-foreground">
              Biggest weakness: <strong>{bufferDays} day buffer estimate</strong><br/>
              Imported records: <strong>{rows.length}</strong>
            </p>
          </Card>

          {/* SUB-SCORE BREAKDOWN */}
          <Card className="col-span-1 md:col-span-2 border-border bg-card/60">
            <CardHeader>
              <CardTitle>Score Component Breakdown</CardTitle>
              <CardDescription>Metrics weighted for irregular income stability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Income Stability", score: Math.max(0, 100 - Math.round(volatility * 60)), status: `${(volatility * 100).toFixed(1)}% volatility`, color: "bg-primary" },
                { label: "Cash Flow Cushion", score: Math.max(0, Math.min(100, Math.round((incomeTotal - expenseTotal) / monthlyIncome * 100))), status: `${Math.round(incomeTotal - expenseTotal)} net`, color: "bg-yellow-500" },
                { label: "Emergency Buffer", score: Math.min(100, bufferDays * 3), status: `${bufferDays} days`, color: "bg-yellow-500" },
                { label: "Debt Pressure", score: Math.max(0, 100 - Math.round((debt / monthlyIncome) * 100)), status: `${Math.round(debt / monthlyIncome * 100)}% of income`, color: "bg-yellow-500" },
                { label: "Expense Flexibility", score: Math.max(0, 100 - Math.round(expenseTotal / monthlyIncome * 100)), status: `${Math.round(expenseTotal / monthlyIncome * 100)}% outflow`, color: "bg-primary" },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">{item.score}/100 — <span className="text-foreground font-medium">{item.status}</span></span>
                  </div>
                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                    <div className={`${item.color} h-2.5 rounded-full transition-all`} style={{ width: `${item.score}%` }}></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* WHY IS MY SCORE CHANGING? (EXPLAINABILITY LAYER - SECTION 52) */}
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDownIcon className="h-5 w-5 text-red-400" />
              <span>Why Your Score Changed (XAI Analysis)</span>
            </CardTitle>
            <CardDescription>Calculated feature impact rankings from the ML engine</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {prediction.top_risk_factors.map((factor: RiskFactor) => (
                <div key={factor.feature_name} className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Rank #{factor.rank}</span>
                    <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">High Impact</span>
                  </div>
                  <div className="text-lg font-bold capitalize mb-1">{factor.feature_name.replace('_', ' ')}</div>
                  <div className="text-2xl font-black text-foreground mb-1">{factor.feature_value}</div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    Impact on risk: <span className="text-red-400 font-bold ml-1">{factor.impact}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-start space-x-3">
              <InfoIcon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="text-sm">
                <span className="font-bold text-foreground">Natural Language Explanation:</span>
                <p className="text-muted-foreground mt-0.5">
                  Based on your imported records, your 90-day distress risk is {(risk * 100).toFixed(0)}%. Income volatility is {(volatility * 100).toFixed(1)}%, with an estimated {bufferDays}-day cash buffer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

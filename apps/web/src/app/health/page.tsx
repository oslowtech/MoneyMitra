import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, AlertTriangleIcon, InfoIcon, TrendingDownIcon } from "lucide-react";
import { fetchDistressPrediction } from "../actions";

export const dynamic = "force-dynamic";

interface RiskFactor {
  feature_name: string;
  feature_value: string;
  impact: string;
  rank: number;
}

export default async function HealthPage() {
  const prediction = await fetchDistressPrediction({
    income_trend: -0.18,
    savings_buffer_days: 9,
    debt_to_income: 0.31,
    income_volatility: 0.45,
    essential_expense_ratio: 0.65
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="flex-1 p-8 max-w-6xl mx-auto space-y-8 overflow-y-auto">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Health</h1>
            <p className="text-muted-foreground">Comprehensive resilience analysis & trajectory intelligence.</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
            <AlertTriangleIcon className="h-4 w-4" />
            <span>Overall Trajectory: Deteriorating (↓ 8 pts)</span>
          </div>
        </header>

        {/* HEALTH SCORE HERO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 border-primary/40 bg-card/60 flex flex-col justify-center items-center p-6 text-center">
            <span className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-2">Resilience Score</span>
            <div className="text-7xl font-black text-primary mb-2">64<span className="text-2xl text-muted-foreground font-normal">/100</span></div>
            <div className="text-sm font-bold text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full mb-4">
              MODERATE RESILIENCE
            </div>
            <p className="text-xs text-muted-foreground">
              Biggest weakness: <strong>Emergency Buffer (9 days)</strong><br/>
              Biggest strength: <strong>Stable Essential Expenses</strong>
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
                { label: "Income Stability", score: 48, status: "Critical Volatility", color: "bg-red-500" },
                { label: "Cash Flow Cushion", score: 61, status: "Moderate", color: "bg-yellow-500" },
                { label: "Emergency Savings", score: 35, status: "Low Buffer (9d)", color: "bg-red-500" },
                { label: "Debt Pressure", score: 52, status: "Manageable EMI", color: "bg-yellow-500" },
                { label: "Expense Flexibility", score: 67, status: "Healthy Baseline", color: "bg-primary" },
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
                  &quot;Your financial resilience score dropped 8 points because your income from Uber declined by 18% over the past 30 days while your recurring essential expenses remained constant, reducing your liquid emergency buffer to 9 days.&quot;
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

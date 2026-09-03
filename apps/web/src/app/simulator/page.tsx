'use client';

import { useState } from 'react';
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sliders, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
import { runWhatIfSimulation } from "../actions";

interface SimulationResult {
  projected_income: number;
  projected_expenses: number;
  projected_cashflow: number;
  emergency_buffer_days: number;
  distress_risk_probability: number;
  risk_status: string;
}

export default function SimulatorPage() {
  const [incomeChange, setIncomeChange] = useState<number>(-20);
  const [expenseChange, setExpenseChange] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult>({
    projected_income: 19600,
    projected_expenses: 15400,
    projected_cashflow: -3800,
    emergency_buffer_days: 8,
    distress_risk_probability: 0.82,
    risk_status: "HIGH"
  });

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    const result = await runWhatIfSimulation({
      income_change_pct: incomeChange,
      expense_change_pct: expenseChange,
      current_monthly_income: 24500,
      current_monthly_expenses: 15400,
      current_monthly_debt: 4500,
      current_savings: 5200
    });
    if (result?.simulated_results) {
      setSimulationResult(result.simulated_results);
    }
    setIsSimulating(false);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="flex-1 min-w-0 p-4 pt-16 sm:p-8 sm:pt-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 overflow-y-auto">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">What-If Financial Simulator</h1>
            <p className="text-muted-foreground">Test how income drops or expense spikes alter your cashflow trajectory.</p>
          </div>
          <Button onClick={handleRunSimulation} className="rounded-full font-bold px-6 space-x-2">
            <RefreshCw className={`h-4 w-4 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>Recalculate Scenario</span>
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SLIDERS CARD */}
          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sliders className="h-5 w-5 text-primary" />
                <span>Adjust Scenario Parameters</span>
              </CardTitle>
              <CardDescription>Simulate platform slowdowns or vehicle repair costs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-4">
              {/* Income Slider */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Gig Income Change:</span>
                  <span className={`font-mono font-bold ${incomeChange < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {incomeChange > 0 ? `+${incomeChange}%` : `${incomeChange}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={incomeChange}
                  onChange={(e) => setIncomeChange(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>-50% (Severe Slowdown)</span>
                  <span>0% (Baseline)</span>
                  <span>+50% (Peak Surge)</span>
                </div>
              </div>

              {/* Expense Slider */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Essential Expense Change:</span>
                  <span className={`font-mono font-bold ${expenseChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {expenseChange > 0 ? `+${expenseChange}%` : `${expenseChange}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="50"
                  step="5"
                  value={expenseChange}
                  onChange={(e) => setExpenseChange(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>-30% (Cut Expenses)</span>
                  <span>0% (Normal)</span>
                  <span>+50% (Urgent Repair)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-secondary/60 border border-border space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase">Baseline Setup</span>
                <p className="text-xs text-muted-foreground">
                  Monthly Baseline Income: <strong>₹24,500</strong> | Monthly Obligations: <strong>₹19,900</strong> | Emergency Savings: <strong>₹5,200</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SIMULATION RESULTS CARD */}
          <Card className="border-primary/50 bg-card/60 flex flex-col justify-between">
            <CardHeader>
              <CardTitle>Projected Financial Outcome</CardTitle>
              <CardDescription>Simulated by Python ML Analytics Service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <span className="text-xs text-muted-foreground font-semibold">Net Cash Flow</span>
                  <div className={`text-2xl font-black mt-1 ${simulationResult.projected_cashflow < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {simulationResult.projected_cashflow < 0 ? '-' : '+'}₹{Math.abs(simulationResult.projected_cashflow).toLocaleString()}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <span className="text-xs text-muted-foreground font-semibold">Emergency Buffer</span>
                  <div className="text-2xl font-black text-foreground mt-1">
                    {simulationResult.emergency_buffer_days} <span className="text-xs font-normal text-muted-foreground">days</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-secondary/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold">Distress Risk Rating</span>
                  <div className="text-xl font-bold flex items-center space-x-2 mt-0.5">
                    {simulationResult.risk_status === 'HIGH' ? (
                      <span className="text-red-400 flex items-center space-x-1">
                        <AlertTriangle className="h-5 w-5" />
                        <span>HIGH DISTRESS RISK ({Math.round((simulationResult.distress_risk_probability || 0.82)*100)}%)</span>
                      </span>
                    ) : (
                      <span className="text-primary flex items-center space-x-1">
                        <ShieldCheck className="h-5 w-5" />
                        <span>STABLE (LOW RISK)</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-xs space-y-1">
                <span className="font-bold text-foreground">Recommended Recovery Action:</span>
                <p className="text-muted-foreground">
                  {simulationResult.projected_cashflow < 0
                    ? "Under this scenario, your cashflow turns negative. Consider saving 15% on high-earning Uber days now to extend your buffer by 5 days."
                    : "Your cashflow remains positive under this scenario. Maintain your ₹5,200 emergency fund."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

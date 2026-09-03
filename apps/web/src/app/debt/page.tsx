import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, CheckCircle2, Clock } from "lucide-react";

export default function DebtPage() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="flex-1 p-8 max-w-6xl mx-auto space-y-8 overflow-y-auto">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Debt & Obligations</h1>
            <p className="text-muted-foreground">Track loans, EMI schedules, credit card utilization, and recurring payments.</p>
          </div>
          <Button variant="outline" className="rounded-full">Add Loan / EMI</Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <CardDescription>Total Outstanding Debt</CardDescription>
              <CardTitle className="text-3xl font-black text-foreground">₹48,500</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">2 Active Loans + 1 Credit Card</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <CardDescription>Upcoming EMI (This Month)</CardDescription>
              <CardTitle className="text-3xl font-black text-yellow-500">₹4,500</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-yellow-500 font-medium">Due on 10th Sept (in 8 days)</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <CardDescription>Credit Utilization</CardDescription>
              <CardTitle className="text-3xl font-black text-primary">31%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">₹15,500 / ₹50,000 Total Limit</p>
            </CardContent>
          </Card>
        </div>

        {/* LOANS TABLE */}
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle>Active Loans & Repayment Schedules</CardTitle>
            <CardDescription>Supabase `loans` and `loan_payments` schedule engine</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="py-3 px-4">Lender / Facility</th>
                    <th className="py-3 px-4">Loan Type</th>
                    <th className="py-3 px-4">Outstanding Principal</th>
                    <th className="py-3 px-4">Monthly EMI</th>
                    <th className="py-3 px-4">Next Due Date</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-secondary/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold">Bajaj Finance</td>
                    <td className="py-3.5 px-4 text-xs">Two-Wheeler Loan</td>
                    <td className="py-3.5 px-4 font-mono">₹28,000</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-yellow-400">₹3,000</td>
                    <td className="py-3.5 px-4 font-mono text-xs">2026-09-10</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded-full flex items-center justify-end w-fit ml-auto space-x-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Upcoming</span>
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold">KreditBee</td>
                    <td className="py-3.5 px-4 text-xs">Personal Micro-loan</td>
                    <td className="py-3.5 px-4 font-mono">₹5,000</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-yellow-400">₹1,500</td>
                    <td className="py-3.5 px-4 font-mono text-xs">2026-09-15</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full flex items-center justify-end w-fit ml-auto space-x-1">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        <span>Scheduled</span>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { createLoan } from "./actions";

export const dynamic = "force-dynamic";

const money = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;

export default async function DebtPage({ searchParams }: { searchParams: Promise<{ error?: string; created?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: loans, error } = await supabase.from("loans").select("id, lender, loan_type, outstanding_principal, next_emi_amount, next_due_date, status").order("next_due_date", { ascending: true });
  const activeLoans = loans || [];
  const outstanding = activeLoans.reduce((sum, loan) => sum + Number(loan.outstanding_principal), 0);
  const emiTotal = activeLoans.reduce((sum, loan) => sum + Number(loan.next_emi_amount || 0), 0);
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="flex-1 p-8 max-w-6xl mx-auto space-y-8 overflow-y-auto">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Debt & Obligations</h1>
            <p className="text-muted-foreground">Track loans, EMI schedules, credit card utilization, and recurring payments.</p>
          </div>
          <a href="#new-loan"><Button variant="outline" className="rounded-full">Add Loan / EMI</Button></a>
        </header>
        {params.error && <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{params.error}</div>}
        {params.created && <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-primary">Loan and EMI schedule saved successfully.</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <CardDescription>Total Outstanding Debt</CardDescription>
              <CardTitle className="text-3xl font-black text-foreground">{money(outstanding)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{activeLoans.length} active loan{activeLoans.length === 1 ? "" : "s"}</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <CardDescription>Upcoming EMI (This Month)</CardDescription>
              <CardTitle className="text-3xl font-black text-yellow-500">{money(emiTotal)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-yellow-500 font-medium">Total scheduled EMI amount</p>
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
                {activeLoans.map((loan) => <tr key={loan.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold">{loan.lender}</td>
                    <td className="py-3.5 px-4 text-xs">{loan.loan_type}</td>
                    <td className="py-3.5 px-4 font-mono">{money(Number(loan.outstanding_principal))}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-yellow-400">{money(Number(loan.next_emi_amount || 0))}</td>
                    <td className="py-3.5 px-4 font-mono text-xs">{loan.next_due_date || "—"}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded-full flex items-center justify-end w-fit ml-auto space-x-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Upcoming</span>
                      </span>
                    </td>
                  </tr>)}
                  {activeLoans.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No loans added yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        {error && <p className="text-sm text-destructive">{error.message}</p>}
        <Card id="new-loan" className="border-primary/40 bg-card/60">
          <CardHeader><CardTitle>Add a loan or EMI</CardTitle><CardDescription>This record is stored privately for your account.</CardDescription></CardHeader>
          <CardContent><form action={createLoan} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <label className="space-y-1 text-sm"><span>Lender</span><input name="lender" required placeholder="Bajaj Finance" className="w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span>Loan type</span><input name="loanType" required placeholder="Two-wheeler" className="w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span>Outstanding</span><input name="outstandingPrincipal" required type="number" min="0" step="0.01" className="w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span>EMI amount</span><input name="emi" required type="number" min="0.01" step="0.01" className="w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span>Next due</span><input name="nextDueDate" required type="date" className="w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
            <Button type="submit" className="md:col-start-5">Save loan</Button>
          </form></CardContent>
        </Card>
      </main>
    </div>
  );
}

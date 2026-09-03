import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, AlertTriangle, ShieldCheck, PhoneCall, ChevronRight, Filter } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

interface CustomerCase {
  id: string;
  name: string;
  employment_type: string;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  trend: '↓↓↓' | '↓↓' | '→' | '↑';
  buffer_days: number;
  income_volatility: string;
  intervention_status: string;
  primary_source: string;
  distress_reasons: string[];
}

export default async function AdvisorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: membership } = user
    ? await supabase.from("organization_members").select("role, organization_id").eq("user_id", user.id).in("role", ["advisor", "admin"]).maybeSingle()
    : { data: null };
  if (!membership) {
    return <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-8"><div className="max-w-md text-center space-y-4"><h1 className="text-2xl font-bold">Officer access required</h1><p className="text-muted-foreground">Your account is signed in, but it is not assigned to a bank organization as an advisor or administrator.</p><p className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-500">Ask your bank administrator to add your user ID to <code>organization_members</code> with role <code>advisor</code> or <code>admin</code>.</p><a href="/auth?next=/advisor" className="text-primary hover:underline">Return to Officer Login</a></div></main>;
  }
  const { data: connections, error: connectionsError } = await supabase
    .from("bank_connections")
    .select("user_id")
    .eq("organization_id", membership.organization_id)
    .eq("status", "active");
  const customerIds = [...new Set((connections || []).map((connection) => connection.user_id))];
  const [profilesResult, financialProfilesResult] = await Promise.all([
    supabase.from("profiles").select("id, full_name").in("id", customerIds.length ? customerIds : ["00000000-0000-0000-0000-000000000000"]),
    supabase.from("financial_profiles").select("user_id, employment_type").in("user_id", customerIds.length ? customerIds : ["00000000-0000-0000-0000-000000000000"]),
  ]);
  const { data: profiles, error: profilesError } = profilesResult;
  const { data: financialProfiles, error: financialProfilesError } = financialProfilesResult;
  const consented = new Set(customerIds);
  const { data: transactions, error: transactionsError } = await supabase.from("transactions").select("user_id, amount, direction, description, source").in("user_id", customerIds.length ? customerIds : ["00000000-0000-0000-0000-000000000000"]);
  const cases: CustomerCase[] = customerIds.filter((customerId) => consented.has(customerId)).map((customerId) => {
    const rows = (transactions || []).filter((transaction) => transaction.user_id === customerId);
    const profile = (profiles || []).find((item) => item.id === customerId);
    const financialProfile = (financialProfiles || []).find((item) => item.user_id === customerId);
    const income = rows.filter((row) => row.direction === "credit").reduce((sum, row) => sum + Number(row.amount), 0);
    const expenses = rows.filter((row) => row.direction === "debit").reduce((sum, row) => sum + Number(row.amount), 0);
    const ratio = income ? expenses / income : 1;
    const bufferDays = expenses > 0 ? Math.max(0, Math.round((income - expenses) / (expenses / 30))) : 0;
    const distressReasons: string[] = [];
    if (!rows.length) distressReasons.push("No transaction history available");
    if (!income) distressReasons.push("No recorded income");
    if (income && ratio > 0.9) distressReasons.push(`Expenses use ${Math.round(ratio * 100)}% of income`);
    else if (income && ratio > 0.7) distressReasons.push(`High expense load at ${Math.round(ratio * 100)}% of income`);
    if (income && income - expenses < 0) distressReasons.push("Negative net cash flow");
    if (income && bufferDays <= 7) distressReasons.push(`Only ${bufferDays} days of estimated buffer`);
    const risk_level = !rows.length || !income ? "LOW" : ratio > 0.9 || income - expenses < 0 ? "HIGH" : ratio > 0.7 || bufferDays <= 7 ? "MEDIUM" : "LOW";
    return { id: customerId, name: profile?.full_name || "Unnamed customer", employment_type: financialProfile?.employment_type || "Not provided", risk_level, trend: ratio > 0.9 ? "↓↓" : ratio > 0.7 ? "→" : "↑", buffer_days: bufferDays, income_volatility: `${rows.length} records`, intervention_status: risk_level === "HIGH" ? "Review required" : risk_level === "MEDIUM" ? "Watch closely" : "Monitored", primary_source: rows.find((row) => row.direction === "credit")?.source || "Not provided", distress_reasons: distressReasons.length ? distressReasons : ["No material distress indicators detected"] };
  });
  const highRisk = cases.filter((customer) => customer.risk_level === "HIGH").length;
  const mediumRisk = cases.filter((customer) => customer.risk_level === "MEDIUM").length;
  const stable = cases.length - highRisk - mediumRisk;
  const portfolioError = profilesError || financialProfilesError || connectionsError || transactionsError;
  const portfolioMessage = portfolioError
    ? `Unable to load the bank portfolio: ${portfolioError.message}`
    : cases.length
      ? null
      : "No customer details are available yet. Add the customer to this bank organization, record active consent, and refresh.";
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="flex-1 min-w-0 p-4 pt-16 sm:p-8 sm:pt-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 overflow-y-auto">
        <header className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold tracking-tight">Financial Wellbeing Officer Portal</h1>
              <span className="bg-primary/20 text-primary border border-primary/40 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
                Bank Deployment
              </span>
            </div>
            <p className="text-muted-foreground">Monitor high-risk customer trajectories & provide human-in-the-loop intervention support.</p>
          </div>
          <Button variant="outline" className="rounded-full space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filter High Risk</span>
          </Button>
        </header>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <CardDescription>Monitored Customers</CardDescription>
              <CardTitle className="text-3xl font-black flex items-center space-x-2">
                <Users className="h-6 w-6 text-primary" />
                <span>{cases.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Assigned Portfolio: Region North-1</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <CardDescription>High Risk Cases</CardDescription>
              <CardTitle className="text-3xl font-black text-red-400 flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-red-400" />
                <span>{highRisk}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-red-400 font-semibold">Immediate Action Required</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <CardDescription>Warning Watchlist</CardDescription>
              <CardTitle className="text-3xl font-black text-yellow-500">{mediumRisk}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Income volatility escalating</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <CardDescription>Stable Trajectories</CardDescription>
              <CardTitle className="text-3xl font-black text-primary">{stable}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Resilience Score &gt; 65</p>
            </CardContent>
          </Card>
        </div>

        {/* ADVISOR CASES TABLE */}
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle>Priority Customer Cases Requiring Support</CardTitle>
            <CardDescription>Row Level Security (RLS) ensures officers only view assigned bank customers</CardDescription>
          </CardHeader>
          <CardContent>
            {portfolioMessage && <p className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-500">{portfolioMessage}</p>}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Segment</th>
                    <th className="py-3 px-4">Distress Risk</th>
                    <th className="py-3 px-4">Trajectory Trend</th>
                    <th className="py-3 px-4">Buffer Days</th>
                    <th className="py-3 px-4">Distress Review</th>
                    <th className="py-3 px-4">Intervention Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cases.map((cust) => (
                    <tr key={cust.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold">
                        {cust.name}
                        <span className="block text-[11px] font-normal text-muted-foreground">{cust.primary_source}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs">{cust.employment_type}</td>
                      <td className="py-3.5 px-4">
                        {cust.risk_level === 'HIGH' && (
                          <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full">HIGH RISK</span>
                        )}
                        {cust.risk_level === 'MEDIUM' && (
                          <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded-full">MEDIUM</span>
                        )}
                        {cust.risk_level === 'LOW' && (
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">STABLE</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-sm">
                        {cust.trend.includes('↓') ? <span className="text-red-400">{cust.trend}</span> : <span className="text-primary">{cust.trend}</span>}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">{cust.buffer_days} days</td>
                      <td className="py-3.5 px-4 text-xs">
                        <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                          {cust.distress_reasons.map((reason) => <li key={reason}>{reason}</li>)}
                        </ul>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium">{cust.intervention_status}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Button size="sm" variant={cust.risk_level === 'HIGH' ? "default" : "outline"} className="rounded-full text-xs space-x-1">
                          <PhoneCall className="h-3 w-3" />
                          <span>Review</span>
                          <ChevronRight className="h-3 w-3 ml-0.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

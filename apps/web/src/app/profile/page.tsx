import { redirect } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import { updateProfileSetup } from "./actions";

const incomeOptions = [
  ["gig", "Gig Work"], ["freelance", "Freelance & Contract"],
  ["salaried", "Fixed Salary"], ["business", "Small Business"],
];
const frequencyOptions = [
  ["daily", "Daily Payouts"], ["weekly", "Weekly Payments"],
  ["irregular", "Irregular / Variable"], ["monthly", "Monthly Fixed"],
];
const goalOptions = [
  ["buffer", "Emergency Buffer Cushion"], ["debt", "Debt & EMI Reduction"],
  ["cashflow", "Stable Cash Flow"], ["saving", "Goal-Based Savings"],
];

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  const { data: profile } = await supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle();
  const { data: setup } = await supabase.from("financial_profiles").select("income_type, risk_preference, financial_goal").eq("user_id", user.id).maybeSingle();
  const params = await searchParams;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="flex-1 min-w-0 p-4 pt-16 sm:p-8 sm:pt-8 max-w-3xl mx-auto space-y-6 sm:space-y-8">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Your Money Mantra setup is saved here and can be changed anytime.</p>
        </header>
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle>{profile?.full_name || "Your financial profile"}</CardTitle>
            <CardDescription>{profile?.email || user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            {params.saved && <p className="mb-4 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-primary">Money Mantra setup saved successfully.</p>}
            {params.error && <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">{params.error}</p>}
            <form action={updateProfileSetup} className="space-y-6">
              <label className="block space-y-2"><span className="text-sm font-semibold">Income type</span><select name="incomeType" defaultValue={setup?.income_type || "gig"} className="w-full rounded-lg border border-input bg-background px-3 py-2"><option value="" disabled>Select income type</option>{incomeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label className="block space-y-2"><span className="text-sm font-semibold">Income frequency</span><select name="frequency" defaultValue={setup?.risk_preference || "irregular"} className="w-full rounded-lg border border-input bg-background px-3 py-2"><option value="" disabled>Select frequency</option>{frequencyOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label className="block space-y-2"><span className="text-sm font-semibold">Primary financial goal</span><select name="goal" defaultValue={setup?.financial_goal || "buffer"} className="w-full rounded-lg border border-input bg-background px-3 py-2"><option value="" disabled>Select goal</option>{goalOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <Button type="submit">Save Money Mantra</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Calendar } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { createSavingsGoal } from "./actions";

export const dynamic = "force-dynamic";

const money = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;

export default async function PlanningPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: goals, error } = await supabase
    .from("savings_goals")
    .select("id, name, target_amount, current_amount, target_date, priority")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="flex-1 p-8 max-w-6xl mx-auto space-y-8 overflow-y-auto">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Planning & Goals</h1>
            <p className="text-muted-foreground">Your savings goals, stored privately in your MoneyMitra account.</p>
          </div>
          <a href="#new-goal"><Button className="rounded-full font-bold px-6 space-x-2"><Plus className="h-4 w-4" /><span>New Financial Goal</span></Button></a>
        </header>

        {params.error && <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{params.error}</div>}
        {params.created && <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-primary">Your financial goal was created successfully.</div>}
        {error && <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">Could not load your goals: {error.message}</div>}

        <Card className="border-primary/40 bg-gradient-to-r from-card to-secondary/30">
          <CardHeader><CardTitle className="flex items-center space-x-2 text-primary"><Sparkles className="h-5 w-5" /><span>Income-Aware Dynamic Saving Rule</span></CardTitle><CardDescription>Personalized for {user?.email}</CardDescription></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Set smaller contributions on slow weeks and increase them on stronger earning days.</CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(goals || []).map((goal) => {
            const target = Number(goal.target_amount);
            const saved = Number(goal.current_amount || 0);
            const progress = Math.min(100, target > 0 ? (saved / target) * 100 : 0);
            return <Card key={goal.id} className="border-border bg-card/60">
              <CardHeader className="pb-3"><div className="flex justify-between items-start"><span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase">{goal.priority} priority</span>{goal.target_date && <span className="text-xs text-muted-foreground flex items-center"><Calendar className="h-3 w-3 mr-1" />{goal.target_date}</span>}</div><CardTitle className="text-xl font-bold mt-2">{goal.name}</CardTitle><CardDescription>Personal savings goal</CardDescription></CardHeader>
              <CardContent className="space-y-4"><div className="flex justify-between text-sm font-semibold"><span>{money(saved)} saved</span><span className="text-muted-foreground">Target: {money(target)}</span></div><div className="w-full bg-secondary h-3 rounded-full overflow-hidden"><div className="bg-primary h-3 rounded-full" style={{ width: `${progress}%` }} /></div><p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p></CardContent>
            </Card>;
          })}
          {(!goals || goals.length === 0) && <Card className="md:col-span-3 border-dashed"><CardContent className="py-10 text-center text-muted-foreground">You have no savings goals yet. Create your first one below.</CardContent></Card>}
        </div>

        <Card id="new-goal" className="border-primary/40 bg-card/60">
          <CardHeader><CardTitle>Create a financial goal</CardTitle><CardDescription>This goal will be saved only to your authenticated account.</CardDescription></CardHeader>
          <CardContent><form action={createSavingsGoal} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <label className="space-y-1 text-sm"><span>Goal name</span><input name="name" required placeholder="Emergency fund" className="w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span>Target amount</span><input name="targetAmount" required type="number" min="1" step="0.01" placeholder="30000" className="w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span>Target date</span><input name="targetDate" type="date" className="w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
            <Button type="submit">Save goal</Button>
          </form></CardContent>
        </Card>
      </main>
    </div>
  );
}

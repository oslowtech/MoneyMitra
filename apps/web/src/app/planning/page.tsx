import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Sparkles, Plus, Calendar, ShieldCheck } from "lucide-react";

export default function PlanningPage() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="flex-1 p-8 max-w-6xl mx-auto space-y-8 overflow-y-auto">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Planning & Goals</h1>
            <p className="text-muted-foreground">Dynamic savings targets tailored for gig-worker variable income streams.</p>
          </div>
          <Button className="rounded-full font-bold px-6 space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Financial Goal</span>
          </Button>
        </header>

        {/* GIG SAVINGS STRATEGY HERO */}
        <Card className="border-primary/40 bg-gradient-to-r from-card to-secondary/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span>Income-Aware Dynamic Saving Rule</span>
            </CardTitle>
            <CardDescription>Why fixed monthly transfers fail for gig workers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              &quot;Because your income fluctuates between ₹800/day and ₹3,500/day, fixed monthly auto-debits risk causing overdrafts during slow weeks. MoneyMitra automatically prompts you to contribute <strong>10%–15%</strong> only on days when your net platform earnings exceed <strong>₹1,800</strong>.&quot;
            </p>
          </CardContent>
        </Card>

        {/* GOALS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border bg-card/60">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase">Priority #1</span>
                <span className="text-xs text-muted-foreground flex items-center"><Calendar className="h-3 w-3 mr-1"/> Target: 4 mos</span>
              </div>
              <CardTitle className="text-xl font-bold mt-2">Emergency Fund</CardTitle>
              <CardDescription>Liquid 14-day cash buffer cushion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm font-semibold">
                <span>₹7,500 Saved</span>
                <span className="text-muted-foreground">Target: ₹30,000</span>
              </div>
              <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                <div className="bg-primary h-3 rounded-full" style={{ width: '25%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">
                At your variable saving rate, you&apos;ll reach this in approx. <strong>4.5 months</strong>.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded-full uppercase">Vehicle Support</span>
                <span className="text-xs text-muted-foreground flex items-center"><Calendar className="h-3 w-3 mr-1"/> Target: 2 mos</span>
              </div>
              <CardTitle className="text-xl font-bold mt-2">Two-Wheeler Service</CardTitle>
              <CardDescription>Brake pad replacement & tire reserve</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm font-semibold">
                <span>₹3,800 Saved</span>
                <span className="text-muted-foreground">Target: ₹6,000</span>
              </div>
              <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '63%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">
                63% complete! On track for your next scheduled service.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full uppercase">Long Term</span>
                <span className="text-xs text-muted-foreground flex items-center"><Calendar className="h-3 w-3 mr-1"/> Target: 12 mos</span>
              </div>
              <CardTitle className="text-xl font-bold mt-2">Family Medical Insurance</CardTitle>
              <CardDescription>Annual policy premium reserve</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm font-semibold">
                <span>₹4,000 Saved</span>
                <span className="text-muted-foreground">Target: ₹15,000</span>
              </div>
              <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                <div className="bg-primary/70 h-3 rounded-full" style={{ width: '27%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">
                Automated micro-contributions active on high earning days.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

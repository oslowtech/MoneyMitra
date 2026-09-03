import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BrainCircuit, ShieldCheck, TrendingUp, type LucideIcon } from "lucide-react";

const engineFeatures: [string, string, LucideIcon][] = [
  ["Signals", "Income trend, volatility, expense ratio, debt pressure, and cash buffer.", Activity],
  ["Forecasts", "30, 60, and 90-day distress risk to support earlier decisions.", TrendingUp],
  ["Explainability", "Every risk review shows the signals behind its recommendation.", BrainCircuit],
  ["Privacy by design", "Data access is user-scoped and advisor access requires organization membership and consent.", ShieldCheck],
];

export default function Ps4EnginePage() {
  return <main className="min-h-screen bg-background text-foreground p-6 sm:p-10">
    <header className="mx-auto flex max-w-6xl items-center justify-between"><Link href="/" className="text-2xl font-bold">Money<span className="text-primary">Mitra</span></Link><Link href="/auth" className={buttonVariants({ variant: "outline", className: "rounded-full" })}>Get started</Link></header>
    <section className="mx-auto max-w-5xl py-16">
      <p className="font-semibold uppercase tracking-wider text-primary">PS4 Intelligence Engine</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Predict financial distress before it becomes a crisis.</h1>
      <p className="mt-6 max-w-2xl text-muted-foreground">The engine turns personal transaction patterns into understandable forecasts and explainable actions for customers and authorized advisors.</p>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {engineFeatures.map(([title, text, Icon]) => <Card key={title} className="bg-card/60"><CardHeader><CardTitle className="flex items-center gap-3"><Icon className="h-5 w-5 text-primary" />{title}</CardTitle></CardHeader><CardContent className="text-muted-foreground">{text}</CardContent></Card>)}
      </div>
    </section>
  </main>;
}

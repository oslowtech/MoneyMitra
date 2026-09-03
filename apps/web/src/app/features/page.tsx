import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, HeartPulse, ShieldCheck, Wallet } from "lucide-react";

const features = [
  ["Personal financial dashboard", "See income, expenses, safe-to-spend money, debt obligations, and resilience in one place.", Wallet],
  ["Financial health insights", "Understand income stability, expense pressure, emergency buffer, and changing risk.", HeartPulse],
  ["Impact Credit Wallet", "Earn separate Health and Green Credits for verified wellbeing and sustainability activities.", BarChart3],
  ["Consent-based bank access", "Connect through read-only consent. MoneyMitra never asks for passwords, PINs, or OTPs.", ShieldCheck],
] as const;

export default function FeaturesPage() {
  return <main className="min-h-screen bg-background text-foreground p-6 sm:p-10">
    <header className="mx-auto flex max-w-6xl items-center justify-between">
      <Link href="/" className="text-2xl font-bold">Money<span className="text-primary">Mitra</span></Link>
      <Link href="/auth" className={buttonVariants({ variant: "outline", className: "rounded-full" })}>Get started</Link>
    </header>
    <section className="mx-auto max-w-6xl py-16">
      <p className="mb-3 font-semibold uppercase tracking-wider text-primary">Built for irregular income</p>
      <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Tools that turn unpredictable income into confident decisions.</h1>
      <p className="mt-6 max-w-2xl text-muted-foreground">MoneyMitra brings your financial data, health signals, and practical actions into one private workspace.</p>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {features.map(([title, description, Icon]) => <Card key={title} className="bg-card/60"><CardHeader><CardTitle className="flex items-center gap-3"><Icon className="h-5 w-5 text-primary" />{title}</CardTitle></CardHeader><CardContent className="text-muted-foreground">{description}</CardContent></Card>)}
      </div>
      <Link href="/guide" className="mt-10 inline-flex items-center gap-2 text-primary hover:underline">Read the user guide <ArrowRight className="h-4 w-4" /></Link>
    </section>
  </main>;
}

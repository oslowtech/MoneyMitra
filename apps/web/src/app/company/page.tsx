import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LockKeyhole, Users, Target, type LucideIcon } from "lucide-react";

const companyValues: [string, string, LucideIcon][] = [
  ["Customer first", "Clear insights and practical actions.", Users],
  ["Privacy focused", "Consent and minimum necessary access.", LockKeyhole],
  ["Built for resilience", "Earlier support, stronger financial buffers.", Target],
];

export default function CompanyPage() {
  return <main className="min-h-screen bg-background text-foreground p-6 sm:p-10">
    <header className="mx-auto flex max-w-6xl items-center justify-between"><Link href="/" className="text-2xl font-bold">Money<span className="text-primary">Mitra</span></Link><Link href="/guide" className={buttonVariants({ variant: "outline", className: "rounded-full" })}>User guide</Link></header>
    <section className="mx-auto max-w-5xl py-16">
      <p className="font-semibold uppercase tracking-wider text-primary">About MoneyMitra</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Financial wellbeing for people whose income does not arrive on a schedule.</h1>
      <p className="mt-6 max-w-2xl text-muted-foreground">We help gig workers, freelancers, and irregular-income households understand today’s choices and prepare for tomorrow’s uncertainty.</p>
      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {companyValues.map(([title, text, Icon]) => <Card key={title} className="bg-card/60"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Icon className="h-5 w-5 text-primary" />{title}</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{text}</CardContent></Card>)}
      </div>
    </section>
  </main>;
}

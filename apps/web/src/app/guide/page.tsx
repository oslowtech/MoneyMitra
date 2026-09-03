import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Camera, FileText, HeartPulse, ShieldCheck, UserRound, Wallet } from "lucide-react";

const sections = [
  {
    icon: UserRound,
    title: "1. Create your account",
    description: "Sign up with email and password or continue with Google. New customers complete the setup once.",
    steps: ["Choose your income type, payment frequency, and primary financial goal.", "Your choices are saved as your Money Mantra.", "Use Profile → Money Mantra Setup to change them later."],
  },
  {
    icon: FileText,
    title: "2. Add your financial data",
    description: "Use Money to import a statement and keep your calculations based on your own records.",
    steps: ["Open Money → Import Statement (CSV).", "Upload a CSV with date, source, amount, direction, and category columns.", "Review your dashboard, Financial Health, and Insights after importing."],
  },
  {
    icon: ShieldCheck,
    title: "3. Give read-only bank consent",
    description: "MoneyMitra never asks for bank passwords, PINs, OTPs, or login details.",
    steps: ["Open Money → Read-only bank connections.", "Select your bank and approved provider.", "Enter the provider connection reference and select Record consent.", "Revoke access any time from the same screen."],
  },
  {
    icon: Wallet,
    title: "4. Use the Impact Wallet",
    description: "Earn separate Health Credits and Green Credits for eligible activities.",
    steps: ["Choose an activity on the Dashboard.", "Add the required evidence reference before submitting.", "For a QR reference, choose Open camera, allow camera access, scan, and review the value.", "Use HTTPS on oslowtech.in for camera access."],
  },
  {
    icon: HeartPulse,
    title: "5. Understand your financial health",
    description: "Your score uses imported income, expenses, volatility, debt pressure, and estimated buffer.",
    steps: ["Financial Health explains the score components.", "Insights highlights trends and practical next steps.", "Simulator lets you test a possible income or expense scenario."],
  },
  {
    icon: Camera,
    title: "Camera and QR troubleshooting",
    description: "Camera scanning requires a secure browser context and permission.",
    steps: ["Open https://oslowtech.in, not an http address.", "Allow camera permission for the site.", "If prompted, select the rear camera.", "If camera access is unavailable, enter an approved evidence reference manually."],
  },
];

export default function GuidePage() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="flex-1 min-w-0 p-4 pt-16 sm:p-8 sm:pt-8 max-w-5xl mx-auto space-y-6 sm:space-y-8">
        <header>
          <div className="flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Guide</h1>
          </div>
          <p className="mt-2 text-muted-foreground">A quick guide to using MoneyMitra safely and getting the most from your financial insights.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title} className="border-border bg-card/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><Icon className="h-5 w-5 text-primary" />{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                    {section.steps.map((step) => <li key={step}>{step}</li>)}
                  </ol>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader><CardTitle>Privacy reminder</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Only connect accounts through an approved read-only consent flow. Never share passwords, PINs, OTPs, or security answers with MoneyMitra or anyone claiming to represent it.
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

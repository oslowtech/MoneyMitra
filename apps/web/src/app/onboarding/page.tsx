'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [incomeType, setIncomeType] = useState<string>('gig');
  const [frequency, setFrequency] = useState<string>('irregular');
  const [goal, setGoal] = useState<string>('buffer');

  const handleComplete = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6">
      {/* Brand */}
      <div className="flex items-center space-x-2 mb-8">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl">
          M
        </div>
        <span className="text-2xl font-bold tracking-tight">Money<span className="text-primary">Mitra</span></span>
      </div>

      <Card className="w-full max-w-lg border-border bg-card/80 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center space-x-2 mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === step ? 'w-8 bg-primary' : s < step ? 'w-4 bg-primary/60' : 'w-4 bg-secondary'
                }`}
              />
            ))}
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === 1 && "What best describes your income?"}
            {step === 2 && "How often do you receive income?"}
            {step === 3 && "What are you working toward?"}
            {step === 4 && "Connecting your financial data"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Select your primary earning model to customize MoneyMitra's analytics."}
            {step === 2 && "Irregular earnings require safe-to-spend dynamic buffer tracking."}
            {step === 3 && "Personalized intervention recommendations will target this goal."}
            {step === 4 && "Import your platform earnings (Swiggy, Uber, Bank CSV) or connect accounts."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          {/* STEP 1: INCOME TYPE */}
          {step === 1 && (
            <div className="space-y-3">
              {[
                { id: 'gig', title: 'Gig Work', desc: 'Uber, Swiggy, Zomato, Porter, Urban Company' },
                { id: 'freelance', title: 'Freelance & Contract', desc: 'Client invoices, Upwork, Fiverr, Consulting' },
                { id: 'salaried', title: 'Fixed Salary', desc: 'Monthly paycheck from single employer' },
                { id: 'business', title: 'Small Business', desc: 'Shopkeeper, vendor, trading revenue' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setIncomeType(opt.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    incomeType === opt.id
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-secondary/30 hover:bg-secondary/60 text-muted-foreground'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-foreground">{opt.title}</div>
                    <div className="text-xs">{opt.desc}</div>
                  </div>
                  {incomeType === opt.id && <Check className="h-5 w-5 text-primary" />}
                </div>
              ))}
            </div>
          )}

          {/* STEP 2: FREQUENCY */}
          {step === 2 && (
            <div className="space-y-3">
              {[
                { id: 'daily', title: 'Daily Payouts', desc: 'Instant cashouts after deliveries or rides' },
                { id: 'weekly', title: 'Weekly Payments', desc: 'Platform payouts processed every Monday' },
                { id: 'irregular', title: 'Irregular / Variable', desc: 'Varies day to day, platform to platform' },
                { id: 'monthly', title: 'Monthly Fixed', desc: 'Single payout on 1st or 30th' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setFrequency(opt.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    frequency === opt.id
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-secondary/30 hover:bg-secondary/60 text-muted-foreground'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-foreground">{opt.title}</div>
                    <div className="text-xs">{opt.desc}</div>
                  </div>
                  {frequency === opt.id && <Check className="h-5 w-5 text-primary" />}
                </div>
              ))}
            </div>
          )}

          {/* STEP 3: GOALS */}
          {step === 3 && (
            <div className="space-y-3">
              {[
                { id: 'buffer', title: 'Emergency Buffer Cushion', desc: 'Build 14-30 days liquid runway for quiet weeks' },
                { id: 'debt', title: 'Debt & EMI Reduction', desc: 'Protect vehicle loan or personal loan EMIs' },
                { id: 'cashflow', title: 'Stable Cash Flow', desc: 'Avoid end-of-month cash deficits' },
                { id: 'saving', title: 'Goal-Based Savings', desc: 'Save for bike repair, family, or equipment' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setGoal(opt.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    goal === opt.id
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-secondary/30 hover:bg-secondary/60 text-muted-foreground'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-foreground">{opt.title}</div>
                    <div className="text-xs">{opt.desc}</div>
                  </div>
                  {goal === opt.id && <Check className="h-5 w-5 text-primary" />}
                </div>
              ))}
            </div>
          )}

          {/* STEP 4: DATA IMPORT */}
          {step === 4 && (
            <div className="space-y-6 text-center py-4">
              <div className="p-6 rounded-2xl bg-secondary/40 border border-dashed border-border flex flex-col items-center space-y-3">
                <UploadCloud className="h-10 w-10 text-primary" />
                <div>
                  <div className="font-bold text-sm">Upload Bank or Platform Statement (CSV)</div>
                  <div className="text-xs text-muted-foreground mt-1">Supports Swiggy, Uber, Zomato, HDFC, SBI, ICICI CSV exports</div>
                </div>
                <Button size="sm" variant="outline" className="rounded-full text-xs">
                  Select CSV File
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-left flex items-start space-x-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">MoneyMitra PS4 Analytics Ready:</span>
                  <p className="mt-0.5">We will calculate your Safe-to-Spend limits and income stability score based on your answers.</p>
                </div>
              </div>
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="flex justify-between pt-4 border-t border-border">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="rounded-full space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            ) : <div />}

            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)} className="rounded-full font-bold px-6 space-x-2">
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="rounded-full font-bold px-8 space-x-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <span>Launch MoneyMitra</span>
                <Sparkles className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

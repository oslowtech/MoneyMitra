'use client';

import { useState } from 'react';
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, CheckCircle, FileText, ArrowUpRight, ArrowDownLeft, ShieldCheck } from "lucide-react";

interface ParsedTransaction {
  id: string;
  date: string;
  source: string;
  category: string;
  amount: number;
  direction: 'credit' | 'debit';
  is_essential: boolean;
}

const INITIAL_TRANSACTIONS: ParsedTransaction[] = [
  { id: '1', date: '2026-08-28', source: 'Uber Payout', category: 'Gig Income', amount: 3450, direction: 'credit', is_essential: false },
  { id: '2', date: '2026-08-27', source: 'Swiggy Pay', category: 'Gig Income', amount: 1200, direction: 'credit', is_essential: false },
  { id: '3', date: '2026-08-25', source: 'Indian Oil Petrol', category: 'Fuel', amount: 450, direction: 'debit', is_essential: true },
  { id: '4', date: '2026-08-24', source: 'Airtel Broadband', category: 'Utilities', amount: 799, direction: 'debit', is_essential: true },
  { id: '5', date: '2026-08-22', source: 'Zomato Delivery', category: 'Gig Income', amount: 1850, direction: 'credit', is_essential: false },
  { id: '6', date: '2026-08-20', source: 'House Rent', category: 'Housing', amount: 12000, direction: 'debit', is_essential: true },
];

export default function MoneyPage() {
  const [transactions, setTransactions] = useState<ParsedTransaction[]>(INITIAL_TRANSACTIONS);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleSimulatedCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    
    // Simulate statement parsing and canonical normalization pipeline (Section 67-70)
    setTimeout(() => {
      const newImportedTx: ParsedTransaction = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        source: 'Swiggy Statement Import',
        category: 'Gig Income',
        amount: 2800,
        direction: 'credit',
        is_essential: false
      };
      setTransactions(prev => [newImportedTx, ...prev]);
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    }, 1500);
  };

  const totalIncome = transactions.filter(t => t.direction === 'credit').reduce((a, b) => a + b.amount, 0);
  const totalExpenses = transactions.filter(t => t.direction === 'debit').reduce((a, b) => a + b.amount, 0);
  const essentialExpenses = transactions.filter(t => t.direction === 'debit' && t.is_essential).reduce((a, b) => a + b.amount, 0);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="flex-1 p-8 max-w-6xl mx-auto space-y-8 overflow-y-auto">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Money & Ingestion</h1>
            <p className="text-muted-foreground">Manage multi-platform gig incomes, accounts, and bank statements.</p>
          </div>
          <div className="relative">
            <input 
              type="file" 
              accept=".csv,.txt" 
              onChange={handleSimulatedCsvUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button className="rounded-full font-bold px-6 space-x-2">
              <UploadCloud className="h-4 w-4" />
              <span>{isUploading ? "Normalizing CSV..." : "Import Statement (CSV)"}</span>
            </Button>
          </div>
        </header>

        {uploadSuccess && (
          <div className="p-4 rounded-xl bg-primary/20 border border-primary/40 text-primary flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium text-sm">Statement parsed successfully! Canonical normalizer categorized essential vs discretionary spending.</span>
          </div>
        )}

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <CardDescription>Total Gig Earnings (30d)</CardDescription>
              <CardTitle className="text-3xl font-black text-green-400 flex items-center space-x-1">
                <ArrowUpRight className="h-6 w-6" />
                <span>₹{totalIncome.toLocaleString()}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Sources: Uber (52%), Swiggy (31%), Zomato (17%)</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <CardDescription>Total Expenses</CardDescription>
              <CardTitle className="text-3xl font-black text-red-400 flex items-center space-x-1">
                <ArrowDownLeft className="h-6 w-6" />
                <span>₹{totalExpenses.toLocaleString()}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Essential Outflow: ₹{essentialExpenses.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <CardDescription>Canonical Normalizer</CardDescription>
              <CardTitle className="text-xl font-bold flex items-center space-x-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <span>Auto Categorization</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Merchant rules & rule engine active. No LLM token bloat on simple transactions.</p>
            </CardContent>
          </Card>
        </div>

        {/* TRANSACTIONS TABLE */}
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle>Recent Normalized Transactions</CardTitle>
            <CardDescription>Supabase PostgreSQL `transactions` table with RLS enforcement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Description / Source</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">{tx.date}</td>
                      <td className="py-3.5 px-4 font-semibold">{tx.source}</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-secondary px-2.5 py-1 rounded text-xs text-muted-foreground font-medium">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {tx.is_essential ? (
                          <span className="text-[11px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">Essential</span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Discretionary</span>
                        )}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold ${tx.direction === 'credit' ? 'text-green-400' : 'text-foreground'}`}>
                        {tx.direction === 'credit' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
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

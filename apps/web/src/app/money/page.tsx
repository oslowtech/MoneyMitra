'use client';

import { useEffect, useState } from 'react';
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, CheckCircle, FileText, ArrowUpRight, ArrowDownLeft, ShieldCheck } from "lucide-react";
import { getUserTransactions, importStatement, type UserTransaction } from "./actions";
import { connectBank, getBankConnections, revokeBankConnection, type BankConnection } from "./bank-actions";

export default function MoneyPage() {
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [bankConnections, setBankConnections] = useState<BankConnection[]>([]);
  const [bankMessage, setBankMessage] = useState<{ success: boolean; text: string } | null>(null);

  useEffect(() => {
    getUserTransactions().then(setTransactions).catch((error) => console.error(error));
    getBankConnections().then(setBankConnections).catch((error) => console.error(error));
  }, []);

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    try {
      const file = e.target.files[0];
      const rows = (await file.text()).split(/\r?\n/).filter(Boolean);
      const imported = rows.slice(1).map((row) => row.split(",")).map(([date, source, amount, direction, category]) => ({
        date: date?.trim(),
        source: source?.trim() || "Imported statement",
        amount: Math.abs(Number(amount?.replace(/[₹,\s]/g, ""))),
        direction: direction?.trim().toLowerCase() === "debit" ? "debit" as const : "credit" as const,
        category: category?.trim() || "Uncategorized",
      })).filter((tx) => /^\d{4}-\d{2}-\d{2}$/.test(tx.date) && Number.isFinite(tx.amount) && tx.amount > 0);
      await importStatement({ fileName: file.name, transactions: imported });
      setTransactions(await getUserTransactions());
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (error) {
      console.error(error);
      setIsUploading(false);
    } finally {
      e.target.value = "";
    }
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
              onChange={handleCsvUpload}
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

        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle>Read-only bank connections</CardTitle>
            <CardDescription>
              Connect through an approved Open Banking or Account Aggregator provider. MoneyMitra never asks for bank passwords, OTPs, or login details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {bankConnections.filter((connection) => connection.status === "active").map((connection) => (
              <div key={connection.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-semibold">{connection.institution_name}</p>
                  <p className="text-xs text-muted-foreground">Provider: {connection.provider} · Read-only consent</p>
                </div>
                <form action={async (formData) => {
                  const result = await revokeBankConnection(formData);
                  setBankMessage({ success: result.success, text: result.message });
                  if (result.success) setBankConnections(await getBankConnections());
                }}>
                  <input type="hidden" name="id" value={connection.id} />
                  <Button type="submit" variant="outline" size="sm">Revoke access</Button>
                </form>
              </div>
            ))}
            <form action={async (formData) => {
              const result = await connectBank(formData);
              setBankMessage({ success: result.success, text: result.message });
              if (result.success) setBankConnections(await getBankConnections());
            }} className="grid gap-3 md:grid-cols-4">
              <select name="institutionName" required defaultValue="" className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option value="" disabled>Select your bank</option>
                <option>Eniac Bank</option>
                <option>State Bank of India</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
                <option>Kotak Mahindra Bank</option>
                <option>IndusInd Bank</option>
                <option>Yes Bank</option>
                <option>Bank of Baroda</option>
                <option>Punjab National Bank</option>
                <option>Canara Bank</option>
                <option>Union Bank of India</option>
                <option>Bank of India</option>
                <option>Indian Bank</option>
                <option>Indian Overseas Bank</option>
                <option>Federal Bank</option>
                <option>IDFC FIRST Bank</option>
                <option>Bandhan Bank</option>
                <option>RBL Bank</option>
                <option>AU Small Finance Bank</option>
                <option>UCO Bank</option>
              </select>
              <select name="provider" required defaultValue="" className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option value="" disabled>Select provider</option>
                <option>Account Aggregator</option>
                <option>Open Banking provider</option>
                <option>Sandbox/demo provider</option>
              </select>
              <input name="providerConnectionId" required placeholder="Provider connection ID" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <Button type="submit">Record consent</Button>
            </form>
            {bankMessage && (
              <div className={`rounded-lg border p-3 text-sm ${bankMessage.success ? "border-primary/40 bg-primary/10 text-primary" : "border-red-500/40 bg-red-500/10 text-red-400"}`}>
                {bankMessage.text}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              The connection ID must come from your provider&apos;s consent flow. Do not enter a username, password, PIN, or OTP.
            </p>
          </CardContent>
        </Card>

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

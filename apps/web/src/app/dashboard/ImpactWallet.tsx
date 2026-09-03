"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { importFitnessCsv, logImpactActivity } from "./impact-actions";

type Rule = { id: string; activity_name: string; activity_code: string; credit_type: string; base_credits: number; impact_multiplier: number; verification_multiplier: number; monthly_cap: number };

export function ImpactWallet({ rules }: { rules: Rule[] }) {
  const [message, setMessage] = useState("");
  const [scannedEvidence, setScannedEvidence] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  useEffect(() => () => {
    if (scannerRef.current?.isScanning) scannerRef.current.stop().catch(() => undefined);
  }, []);
  async function toggleScanner() {
    if (scannerOpen) {
      if (scannerRef.current?.isScanning) await scannerRef.current.stop();
      scannerRef.current = null;
      setScannerOpen(false);
      return;
    }
    setScannerOpen(true);
    const scanner = new Html5Qrcode("impact-qr-reader");
    scannerRef.current = scanner;
    try {
      await scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 220, height: 220 } }, async (decodedText) => {
        setScannedEvidence(decodedText);
        setMessage("QR evidence scanned. Review it in the evidence field before submitting.");
        await scanner.stop();
        scannerRef.current = null;
        setScannerOpen(false);
      }, () => undefined);
    } catch (error) {
      setMessage(error instanceof Error ? `Camera unavailable: ${error.message}` : "Camera permission was denied.");
      setScannerOpen(false);
    }
  }
  async function submitActivity(event: React.FormEvent<HTMLFormElement>, activityName: string) {
    event.preventDefault();
    setMessage("");
    const form = event.currentTarget;
    try {
      const result = await logImpactActivity(new FormData(form));
      setMessage(result.success ? result.message : result.error);
      if (result.success) form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit activity.");
    }
  }
  async function submitFitnessCsv(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = event.currentTarget;
    try {
      const result = await importFitnessCsv(new FormData(form));
      setMessage(result.success ? result.message : result.error);
      if (result.success) form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to import fitness CSV.");
    }
  }
  return <div className="space-y-6">
    <div>
      <h3 className="font-semibold mb-3">Log an eligible activity</h3>
      <div className="grid gap-3 md:grid-cols-2">{rules.map((rule) => <form key={rule.id} onSubmit={(event) => submitActivity(event, rule.activity_name)} className="rounded-lg border border-border p-3">
        <input type="hidden" name="activityId" value={rule.id} /><div className="flex items-center justify-between gap-2"><div><p className="font-medium">{rule.activity_name}</p><p className="text-xs text-muted-foreground">{rule.credit_type === "HEALTH" ? "🩺 Health" : "🌱 Green"} · cap {rule.monthly_cap}/month</p></div><select name="verificationLevel" defaultValue="1" className="rounded border border-input bg-background px-2 py-1 text-xs"><option value="1">Evidence</option><option value="2">Auto verified</option><option value="3">Partner verified</option></select></div>
        <div className="mt-3 flex gap-2"><input key={scannedEvidence} name="evidenceUrl" required defaultValue={scannedEvidence} placeholder={rule.activity_code === "BLOOD_DONATION" ? "Donation center proof or QR reference" : "Evidence URL or QR reference"} className="min-w-0 flex-1 rounded border border-input bg-background px-2 py-1 text-xs" /><Button type="submit" size="sm">Submit evidence</Button></div>
      </form>)}</div>
    </div>
    <form onSubmit={submitFitnessCsv} className="rounded-lg border border-border p-4"><p className="font-semibold">Import Google Fit / fitness watch CSV</p><p className="text-xs text-muted-foreground mb-3">Required columns: date,activity,duration_minutes. Supported activities: WALKING and CYCLING. Dates must be YYYY-MM-DD.</p><input type="file" name="fitnessCsv" accept=".csv,text/csv" required className="text-sm" /><Button type="submit" size="sm" className="ml-3">Import fitness data</Button></form>
    <div className="rounded-lg border border-dashed border-primary/40 p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold">Scan evidence QR</p><p className="text-xs text-muted-foreground">Allow camera access, scan a provider QR, then review the value before submitting.</p></div><Button type="button" variant="outline" onClick={toggleScanner}>{scannerOpen ? "Close camera" : "Open camera"}</Button></div>{scannerOpen && <div id="impact-qr-reader" className="mt-4 max-w-sm overflow-hidden rounded-lg" />}</div>
    {message && <p className="text-sm text-primary">{message}</p>}
  </div>;
}

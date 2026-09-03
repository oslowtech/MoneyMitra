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
  useEffect(() => {
    if (!scannerOpen) return;
    let cancelled = false;
    const scanner = new Html5Qrcode("impact-qr-reader");
    scannerRef.current = scanner;
    const config = { fps: 10, qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
        const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.7);
        return { width: Math.max(160, Math.min(280, size)), height: Math.max(160, Math.min(280, size)) };
      } };
    const onScan = async (decodedText: string) => {
        if (cancelled) return;
        setScannedEvidence(decodedText);
        setMessage("QR evidence scanned. Review it in the evidence field before submitting.");
        if (scanner.isScanning) await scanner.stop();
        scannerRef.current = null;
        setScannerOpen(false);
      };
    const onError = () => undefined;
    const startScanner = async () => {
      if (!window.isSecureContext) {
        throw new Error("Camera access requires HTTPS. Open https://oslowtech.in, not http://oslowtech.in.");
      }
      try {
        await scanner.start({ facingMode: "environment" }, config, onScan, onError);
      } catch (facingModeError) {
        const cameras = await Html5Qrcode.getCameras();
        const rearCamera = cameras.find((camera) => /back|rear|environment|world/i.test(camera.label)) || cameras[0];
        if (!rearCamera) throw facingModeError;
        await scanner.start({ deviceId: { exact: rearCamera.id } }, config, onScan, onError);
      }
    };
    startScanner().catch((error: unknown) => {
      if (cancelled) return;
      const detail = error instanceof Error ? error.message : "Camera permission was denied.";
      setMessage(`Camera unavailable: ${detail} Check browser camera permission for oslowtech.in.`);
      scannerRef.current = null;
      setScannerOpen(false);
    });
    return () => {
      cancelled = true;
      if (scanner.isScanning) scanner.stop().catch(() => undefined);
      scannerRef.current = null;
    };
  }, [scannerOpen]);
  function toggleScanner() {
    setScannerOpen((open) => !open);
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

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

const verificationMultipliers = [0.5, 0.8, 1, 1.2];
type ActionResult = { success: true; message: string } | { success: false; error: string };

export async function logImpactActivity(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be signed in." };
  const activityId = String(formData.get("activityId") || "");
  const evidenceUrl = String(formData.get("evidenceUrl") || "").trim();
  const normalizedEvidence = evidenceUrl.toLowerCase();
  if (!evidenceUrl) return { success: false, error: "Evidence is required for every activity." };
  const { data: usedEvidence } = await supabase.from("impact_transactions")
    .select("id")
    .eq("evidence_url", normalizedEvidence)
    .limit(1)
    .maybeSingle();
  if (usedEvidence) return { success: false, error: "This evidence reference has already been used." };
  const verificationLevel = Math.max(0, Math.min(3, Number(formData.get("verificationLevel") || 0)));
  const { data: rule, error: ruleError } = await supabase.from("impact_activity_rules").select("*").eq("id", activityId).eq("active", true).single();
  if (ruleError || !rule) return { success: false, error: "This impact activity is not available." };
  if (rule.activity_code === "MINDFULNESS") {
    rule.activity_code = "BLOOD_DONATION";
    rule.activity_name = "Blood donation";
    rule.category = "preventive_care";
    rule.base_credits = 30;
    rule.impact_multiplier = 1.5;
    rule.verification_multiplier = 0.8;
    rule.monthly_cap = 90;
  }
  const monthStart = new Date();
  monthStart.setDate(1);
  const { data: existing } = await supabase.from("impact_transactions").select("credits").eq("user_id", user.id).eq("activity_id", activityId).gte("created_at", monthStart.toISOString()).in("transaction_type", ["EARN", "BONUS"]);
  const used = (existing || []).reduce((sum, entry) => sum + Number(entry.credits), 0);
  const credits = Math.floor(Number(rule.base_credits) * Number(rule.impact_multiplier) * verificationMultipliers[verificationLevel]);
  if (credits <= 0 || used + credits > Number(rule.monthly_cap)) return { success: false, error: "This activity has reached its monthly credit cap." };
  const { error } = await supabase.from("impact_transactions").insert({
    user_id: user.id, activity_id: activityId, credit_type: rule.credit_type, transaction_type: "EARN",
    credits, verification_level: verificationLevel, evidence_url: normalizedEvidence, financial_benefit_estimate: rule.financial_benefit_estimate,
  });
  if (error) {
    if (error.code === "23505") return { success: false, error: "This evidence reference has already been used." };
    return { success: false, error: `Unable to log activity: ${error.message}` };
  }
  const walletField = rule.credit_type === "HEALTH" ? "health_credit_balance" : "green_credit_balance";
  const { data: wallet } = await supabase.from("impact_wallets").select("health_credit_balance, green_credit_balance").eq("user_id", user.id).maybeSingle();
  const { error: walletError } = await supabase.from("impact_wallets").upsert({ user_id: user.id, health_credit_balance: Number(wallet?.health_credit_balance || 0) + (walletField === "health_credit_balance" ? credits : 0), green_credit_balance: Number(wallet?.green_credit_balance || 0) + (walletField === "green_credit_balance" ? credits : 0), updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (walletError) return { success: false, error: `Unable to update wallet: ${walletError.message}` };
  revalidatePath("/dashboard");
  return { success: true, message: "Activity submitted successfully." };
}

export async function importFitnessCsv(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be signed in." };
  const file = formData.get("fitnessCsv");
  if (!(file instanceof File)) return { success: false, error: "Select a fitness CSV file." };
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return { success: false, error: "Fitness CSV must include a header and at least one row." };
  const header = lines[0].split(",").map((value) => value.trim().toLowerCase());
  const dateIndex = header.indexOf("date");
  const activityIndex = header.indexOf("activity");
  const durationIndex = header.indexOf("duration_minutes");
  if (dateIndex < 0 || activityIndex < 0 || durationIndex < 0) return { success: false, error: "Fitness CSV requires date,activity,duration_minutes." };
  const { data: rules } = await supabase.from("impact_activity_rules").select("id, activity_code, base_credits, impact_multiplier, verification_multiplier, monthly_cap").in("activity_code", ["WALKING", "CYCLING"]);
  const ruleMap = new Map((rules || []).map((rule) => [rule.activity_code, rule]));
  let imported = 0;
  for (const line of lines.slice(1)) {
    const values = line.split(",").map((value) => value.trim());
    const date = values[dateIndex];
    const activity = values[activityIndex]?.toUpperCase();
    const duration = Number(values[durationIndex]);
    if (!Number.isFinite(duration) || duration <= 0) return { success: false, error: `Invalid duration in fitness CSV: ${values[durationIndex]}` };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) return { success: false, error: `Invalid date in fitness CSV: ${date}` };
    const code = activity.includes("CYCL") ? "CYCLING" : activity.includes("WALK") ? "WALKING" : "";
    const rule = ruleMap.get(code);
    if (!rule) return { success: false, error: `Unsupported fitness activity: ${activity}` };
    const verificationLevel = 2;
    const credits = Math.floor(Number(rule.base_credits) * Number(rule.impact_multiplier) * Number(rule.verification_multiplier));
    const evidenceUrl = `fitness-csv:${file.name}:${date}:${imported}`;
    const { error } = await supabase.from("impact_transactions").insert({ user_id: user.id, activity_id: rule.id, credit_type: code === "WALKING" ? "HEALTH" : "GREEN", transaction_type: "EARN", credits, verification_level: verificationLevel, evidence_url: evidenceUrl, financial_benefit_estimate: 0, created_at: `${date}T12:00:00Z` });
    if (error) return { success: false, error: `Unable to import ${date}: ${error.message}` };
    imported++;
  }
  if (!imported) return { success: false, error: "No valid fitness rows found." };
  revalidatePath("/dashboard");
  return { success: true, message: "Fitness CSV imported successfully with validated dates." };
}

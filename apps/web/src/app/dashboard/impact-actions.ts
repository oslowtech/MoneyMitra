"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

const verificationMultipliers = [0.5, 0.8, 1, 1.2];

export async function logImpactActivity(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  const activityId = String(formData.get("activityId") || "");
  const verificationLevel = Math.max(0, Math.min(3, Number(formData.get("verificationLevel") || 0)));
  const { data: rule, error: ruleError } = await supabase.from("impact_activity_rules").select("*").eq("id", activityId).eq("active", true).single();
  if (ruleError || !rule) throw new Error("This impact activity is not available.");
  const monthStart = new Date();
  monthStart.setDate(1);
  const { data: existing } = await supabase.from("impact_transactions").select("credits").eq("user_id", user.id).eq("activity_id", activityId).gte("created_at", monthStart.toISOString()).in("transaction_type", ["EARN", "BONUS"]);
  const used = (existing || []).reduce((sum, entry) => sum + Number(entry.credits), 0);
  const credits = Math.floor(Number(rule.base_credits) * Number(rule.impact_multiplier) * verificationMultipliers[verificationLevel]);
  if (credits <= 0 || used + credits > Number(rule.monthly_cap)) throw new Error("This activity has reached its monthly credit cap.");
  const { error } = await supabase.from("impact_transactions").insert({
    user_id: user.id, activity_id: activityId, credit_type: rule.credit_type, transaction_type: "EARN",
    credits, verification_level: verificationLevel, financial_benefit_estimate: rule.financial_benefit_estimate,
  });
  if (error) throw new Error(`Unable to log activity: ${error.message}`);
  const walletField = rule.credit_type === "HEALTH" ? "health_credit_balance" : "green_credit_balance";
  const { data: wallet } = await supabase.from("impact_wallets").select("health_credit_balance, green_credit_balance").eq("user_id", user.id).maybeSingle();
  await supabase.from("impact_wallets").upsert({ user_id: user.id, health_credit_balance: Number(wallet?.health_credit_balance || 0) + (walletField === "health_credit_balance" ? credits : 0), green_credit_balance: Number(wallet?.green_credit_balance || 0) + (walletField === "green_credit_balance" ? credits : 0), updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  revalidatePath("/dashboard");
}

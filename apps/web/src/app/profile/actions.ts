"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function updateProfileSetup(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const incomeType = String(formData.get("incomeType") ?? "").trim();
  const frequency = String(formData.get("frequency") ?? "").trim();
  const goal = String(formData.get("goal") ?? "").trim();
  if (!incomeType || !frequency || !goal) {
    redirect("/profile?error=Please select an income type, payment frequency, and financial goal.");
  }

  const { error } = await supabase.from("financial_profiles").upsert({
    user_id: user.id,
    income_type: incomeType,
    employment_type: incomeType === "business" ? "self_employed" : incomeType,
    financial_goal: goal,
    risk_preference: frequency,
  }, { onConflict: "user_id" });
  if (error) redirect(`/profile?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  redirect("/profile?saved=1");
}

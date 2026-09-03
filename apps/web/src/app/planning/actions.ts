"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function createSavingsGoal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const name = String(formData.get("name") ?? "").trim();
  const targetAmount = Number(formData.get("targetAmount"));
  const targetDate = String(formData.get("targetDate") ?? "").trim() || null;

  if (!name || !Number.isFinite(targetAmount) || targetAmount <= 0) {
    redirect("/planning?error=Enter a goal name and a target amount greater than zero");
  }

  const { error } = await supabase.from("savings_goals").insert({
    user_id: user.id,
    name,
    target_amount: targetAmount,
    target_date: targetDate,
    priority: String(formData.get("priority") ?? "medium"),
  });

  if (error) redirect(`/planning?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/planning");
  redirect("/planning?created=1");
}

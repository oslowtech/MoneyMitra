"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function createLoan(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const lender = String(formData.get("lender") ?? "").trim();
  const loanType = String(formData.get("loanType") ?? "").trim();
  const outstanding = Number(formData.get("outstandingPrincipal"));
  const emi = Number(formData.get("emi"));
  const dueDate = String(formData.get("nextDueDate") ?? "").trim();

  if (!lender || !loanType || !Number.isFinite(outstanding) || outstanding < 0 || !Number.isFinite(emi) || emi <= 0 || !dueDate) {
    redirect("/debt?error=Enter lender, loan type, outstanding amount, EMI, and next due date");
  }

  const { data: loan, error } = await supabase.from("loans").insert({
    user_id: user.id,
    lender,
    loan_type: loanType,
    principal: outstanding,
    outstanding_principal: outstanding,
    next_emi_amount: emi,
    next_due_date: dueDate,
  }).select("id").single();

  if (error) redirect(`/debt?error=${encodeURIComponent(error.message)}`);

  const { error: paymentError } = await supabase.from("loan_payments").insert({
    loan_id: loan.id,
    due_date: dueDate,
    amount_due: emi,
  });
  if (paymentError) redirect(`/debt?error=${encodeURIComponent(paymentError.message)}`);
  revalidatePath("/debt");
  redirect("/debt?created=1");
}

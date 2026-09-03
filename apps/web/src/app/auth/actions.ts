"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) redirect(`/auth?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/", "layout");
  const next = String(formData.get("next") ?? "/dashboard");
  if (next === "/advisor") {
    const { data: officerMembership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id || "")
      .in("role", ["advisor", "admin"])
      .maybeSingle();
    if (!officerMembership) {
      await supabase.auth.signOut();
      redirect("/auth?next=/advisor&error=This account is not registered as a bank officer. Ask your bank administrator to assign the advisor or admin role.");
    }
  }
  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) redirect(`/auth?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/", "layout");
  redirect(data.session ? "/onboarding" : "/auth?message=Check your email to confirm your account");
}

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createClient();
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  const forwardedProto = requestHeaders.get("x-forwarded-proto") || "http";
  const siteUrl = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const next = String(formData.get("next") ?? "/dashboard");
  const callbackUrl = new URL(`${siteUrl}/auth/callback`);
  callbackUrl.searchParams.set("next", next.startsWith("/") ? next : "/dashboard");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl.toString() },
  });
  if (error || !data.url) {
    redirect(`/auth?error=${encodeURIComponent(error?.message || "Google sign-in is unavailable")}`);
  }
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth");
}

export async function saveOnboarding(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const incomeType = String(formData.get("incomeType") ?? "gig");
  const frequency = String(formData.get("frequency") ?? "irregular");
  const goal = String(formData.get("goal") ?? "buffer");

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name ?? null,
  }, { onConflict: "id" });
  if (profileError) {
    redirect(`/onboarding?error=${encodeURIComponent(profileError.message)}`);
  }

  const { error } = await supabase.from("financial_profiles").upsert({
    user_id: user.id,
    income_type: incomeType,
    employment_type: incomeType === "business" ? "self_employed" : incomeType,
    financial_goal: goal,
    risk_preference: frequency,
  }, { onConflict: "user_id" });

  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

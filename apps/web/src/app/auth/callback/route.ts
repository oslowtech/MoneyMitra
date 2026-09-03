import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(error.message)}`, url));
    if (!next?.startsWith("/advisor")) {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: setup } = user
        ? await supabase.from("financial_profiles").select("user_id").eq("user_id", user.id).maybeSingle()
        : { data: null };
      if (!setup) return NextResponse.redirect(new URL("/onboarding", url));
    }
  }
  return NextResponse.redirect(new URL(next?.startsWith("/") ? next : "/dashboard", url));
}

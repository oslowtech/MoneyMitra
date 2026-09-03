"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export interface BankConnection {
  id: string;
  institution_name: string;
  provider: string;
  provider_connection_id: string;
  status: "active" | "revoked" | "expired";
  consented_at: string;
}

export async function getBankConnections(): Promise<BankConnection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("bank_connections")
    .select("id, institution_name, provider, provider_connection_id, status, consented_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Unable to load bank connections: ${error.message}`);
  return data || [];
}

export async function connectBank(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in to connect a bank.");

  const institutionName = String(formData.get("institutionName") ?? "").trim();
  const provider = String(formData.get("provider") ?? "").trim();
  const providerConnectionId = String(formData.get("providerConnectionId") ?? "").trim();
  if (!institutionName || !provider || !providerConnectionId) {
    throw new Error("Bank, provider, and provider connection reference are required.");
  }

  const { error } = await supabase.from("bank_connections").upsert({
    user_id: user.id,
    institution_name: institutionName,
    provider,
    provider_connection_id: providerConnectionId,
    status: "active",
    revoked_at: null,
    consented_at: new Date().toISOString(),
  }, { onConflict: "user_id,provider,provider_connection_id" });
  if (error) throw new Error(`Unable to save bank consent: ${error.message}`);
  revalidatePath("/money");
}

export async function revokeBankConnection(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Bank connection is missing.");

  const { error } = await supabase.from("bank_connections").update({
    status: "revoked",
    revoked_at: new Date().toISOString(),
  }).eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(`Unable to revoke bank consent: ${error.message}`);
  revalidatePath("/money");
}

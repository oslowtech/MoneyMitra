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

export type BankActionResult = {
  success: boolean;
  message: string;
};

export async function getBankConnections(): Promise<BankConnection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("bank_connections")
    .select("id, institution_name, provider, provider_connection_id, status, consented_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Unable to load bank connections: ${error.message}`);
  return data || [];
}

export async function connectBank(formData: FormData): Promise<BankActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "You must be signed in to connect a bank." };

  const institutionName = String(formData.get("institutionName") ?? "").trim();
  const provider = String(formData.get("provider") ?? "").trim();
  const providerConnectionId = String(formData.get("providerConnectionId") ?? "").trim();
  if (!institutionName || !provider || !providerConnectionId) {
    return { success: false, message: "Bank, provider, and provider connection reference are required." };
  }

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("id")
    .eq("name", institutionName)
    .eq("type", "bank")
    .maybeSingle();
  if (organizationError) return { success: false, message: `Unable to find bank organization: ${organizationError.message}` };
  if (!organization) return { success: false, message: "This bank is not configured yet. Ask an administrator to create its bank organization first." };

  const { error } = await supabase.from("bank_connections").upsert({
    user_id: user.id,
    organization_id: organization.id,
    institution_name: institutionName,
    provider,
    provider_connection_id: providerConnectionId,
    status: "active",
    revoked_at: null,
    consented_at: new Date().toISOString(),
  }, { onConflict: "user_id,provider,provider_connection_id" });
  if (error) return { success: false, message: `Unable to save bank consent: ${error.message}` };
  const { error: membershipError } = await supabase.from("organization_members").upsert({
    organization_id: organization.id,
    user_id: user.id,
    role: "customer",
  }, { onConflict: "organization_id,user_id" });
  if (membershipError) return { success: false, message: `Unable to affiliate your account with this bank: ${membershipError.message}` };
  revalidatePath("/money");
  return { success: true, message: "Bank consent recorded successfully." };
}

export async function revokeBankConnection(formData: FormData): Promise<BankActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "You must be signed in." };
  const id = String(formData.get("id") ?? "");
  if (!id) return { success: false, message: "Bank connection is missing." };

  const { error } = await supabase.from("bank_connections").update({
    status: "revoked",
    revoked_at: new Date().toISOString(),
  }).eq("id", id).eq("user_id", user.id);
  if (error) return { success: false, message: `Unable to revoke bank consent: ${error.message}` };
  revalidatePath("/money");
  return { success: true, message: "Bank consent revoked successfully." };
}

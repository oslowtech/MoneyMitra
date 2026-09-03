"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export interface UserTransaction {
  id: string;
  date: string;
  source: string;
  category: string;
  amount: number;
  direction: "credit" | "debit";
  is_essential: boolean;
}

export async function getUserTransactions(): Promise<UserTransaction[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("id, transaction_date, source, description, amount, direction, category_id")
    .order("transaction_date", { ascending: false });
  if (error) throw new Error(`Unable to load transactions: ${error.message}`);
  return (data || []).map((row) => ({
    id: row.id,
    date: row.transaction_date,
    source: row.source || row.description || "Statement transaction",
    category: row.description || "Uncategorized",
    amount: Number(row.amount),
    direction: row.direction,
    is_essential: false,
  }));
}

export async function importStatement(input: {
  fileName: string;
  transactions: Array<Omit<UserTransaction, "id" | "is_essential">>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in to import a statement.");
  if (input.transactions.length === 0) throw new Error("The statement has no valid transactions.");

  const { data: statement, error: statementError } = await supabase
    .from("statement_imports")
    .insert({ user_id: user.id, file_name: input.fileName, transaction_count: input.transactions.length })
    .select("id")
    .single();
  if (statementError) throw new Error(`Unable to save statement: ${statementError.message}`);

  const { error } = await supabase.from("transactions").insert(input.transactions.map((tx) => ({
    user_id: user.id,
    transaction_date: tx.date,
    amount: tx.amount,
    direction: tx.direction,
    source: tx.source,
    description: tx.category,
    statement_import_id: statement.id,
  })));
  if (error) throw new Error(`Unable to save statement transactions: ${error.message}`);
  revalidatePath("/money");
  revalidatePath("/dashboard");
}

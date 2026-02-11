"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SplitBill {
  id: string;
  user_id: string;
  title: string;
  total_amount: number;
  currency: string;
  date: string;
  notes?: string;
  status: "active" | "settled";
  created_at: string;
  participants?: SplitBillParticipant[];
}

export interface SplitBillParticipant {
  id: string;
  split_bill_id: string;
  name: string;
  amount: number;
  is_paid: boolean;
  paid_at?: string;
}

export async function getSplitBills(): Promise<SplitBill[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("split_bills")
    .select("*, participants:split_bill_participants(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data || []) as SplitBill[];
}

export async function createSplitBill(
  title: string,
  totalAmount: number,
  participants: { name: string; amount: number }[],
  notes?: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: bill, error } = await supabase
    .from("split_bills")
    .insert({
      user_id: user.id,
      title,
      total_amount: totalAmount,
      notes,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Add participants
  if (participants.length > 0) {
    const rows = participants.map((p) => ({
      split_bill_id: bill.id,
      name: p.name,
      amount: p.amount,
    }));
    await supabase.from("split_bill_participants").insert(rows);
  }

  revalidatePath("/split-bills");
  return { data: bill };
}

export async function toggleParticipantPaid(
  participantId: string,
  isPaid: boolean,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("split_bill_participants")
    .update({
      is_paid: isPaid,
      paid_at: isPaid ? new Date().toISOString() : null,
    })
    .eq("id", participantId);

  if (error) return { error: error.message };

  revalidatePath("/split-bills");
  return {};
}

export async function settleSplitBill(billId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("split_bills")
    .update({ status: "settled", updated_at: new Date().toISOString() })
    .eq("id", billId);

  if (error) return { error: error.message };

  revalidatePath("/split-bills");
  return {};
}

export async function deleteSplitBill(billId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("split_bills")
    .delete()
    .eq("id", billId);

  if (error) return { error: error.message };

  revalidatePath("/split-bills");
  return {};
}

"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveUser(userId: string) {
  const adminClient = await createAdminClient();
  await adminClient.from("profiles").update({ is_approved: true }).eq("id", userId);
  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  const adminClient = await createAdminClient();
  await adminClient.auth.admin.deleteUser(userId);
  revalidatePath("/admin/users");
}

export async function createUser(formData: FormData) {
  const adminClient = await createAdminClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("display_name") as string;

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: displayName },
  });

  if (error) return { error: error.message };

  if (data.user) {
    await adminClient.from("profiles").update({
      display_name: displayName,
      is_approved: true,
    }).eq("id", data.user.id);
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function resetRanking() {
  const supabase = await createClient();
  const adminClient = await createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  await adminClient.from("profiles").update({ elo: 1000, wins: 0, losses: 0 }).neq("id", "00000000-0000-0000-0000-000000000000");

  await adminClient.from("elo_history").insert(
    (await adminClient.from("profiles").select("id")).data?.map((p) => ({
      player_id: p.id,
      elo: 1000,
      delta: 0,
      match_id: null,
    })) ?? []
  );

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

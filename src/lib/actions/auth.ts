"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { usernameToEmail } from "@/lib/username";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });

  if (error) return { error: "Ungültiger Benutzername oder Passwort." };

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, is_approved")
    .eq("id", user!.id)
    .single();

  if (profile?.is_admin) redirect("/admin");
  if (profile?.is_approved) redirect("/dashboard");
  redirect("/awaiting-approval");
}

export async function signUp(formData: FormData) {
  const adminClient = await createAdminClient();
  const username = (formData.get("username") as string).trim();
  const password = formData.get("password") as string;

  // Admin-Client mit email_confirm: true — umgeht E-Mail-Bestätigung komplett
  const { data, error } = await adminClient.auth.admin.createUser({
    email: usernameToEmail(username),
    password,
    email_confirm: true,
    user_metadata: { full_name: username },
  });

  if (error) {
    if (error.message.includes("already been registered") || error.message.includes("already exists")) {
      return { error: "Dieser Benutzername ist bereits vergeben." };
    }
    return { error: error.message };
  }

  // Profil updaten (Trigger legt es an, wir setzen display_name korrekt)
  if (data.user) {
    await adminClient.from("profiles").update({
      display_name: username,
    }).eq("id", data.user.id);
  }

  redirect("/awaiting-approval");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

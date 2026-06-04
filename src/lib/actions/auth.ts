"use server";

import { createClient } from "@/lib/supabase/server";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, is_approved")
    .single();

  if (profile?.is_admin) redirect("/admin");
  if (profile?.is_approved) redirect("/dashboard");
  redirect("/awaiting-approval");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const username = (formData.get("username") as string).trim();
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email: usernameToEmail(username),
    password,
    options: {
      data: { full_name: username },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Dieser Benutzername ist bereits vergeben." };
    }
    return { error: error.message };
  }

  // Update display_name in profile (trigger creates it with full_name)
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase
      .from("profiles")
      .update({ display_name: username })
      .eq("id", user.id);
  }

  redirect("/awaiting-approval");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

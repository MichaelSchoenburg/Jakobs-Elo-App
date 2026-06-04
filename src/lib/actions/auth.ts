"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) return { error: error.message };

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

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("display_name") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: displayName },
    },
  });

  if (error) return { error: error.message };

  // Update display_name in profile (trigger creates profile with full_name from metadata)
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", user.id);
  }

  redirect("/awaiting-approval");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

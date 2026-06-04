import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/ui/NavBar";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar isAdmin={true} />
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">{children}</div>
    </div>
  );
}

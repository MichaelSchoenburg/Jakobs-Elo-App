import { createClient } from "@/lib/supabase/server";
import { UserRow } from "@/components/admin/UserRow";
import { CreateUserForm } from "@/components/admin/CreateUserForm";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, player_id, elo, wins, losses, is_approved, is_admin, created_at")
    .order("created_at", { ascending: true });

  const pending = profiles?.filter((p) => !p.is_approved) ?? [];
  const active = profiles?.filter((p) => p.is_approved) ?? [];

  return (
    <div className="space-y-10">
      <h1 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.4em] uppercase text-[var(--color-muted)]">
        Spielerverwaltung
      </h1>

      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-accent)] flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-[var(--color-accent)]" />
            Freigabe ausstehend ({pending.length})
          </h2>
          <div className="border border-[var(--color-accent)] divide-y divide-[var(--color-border)]">
            {pending.map((p) => (
              <UserRow key={p.id} profile={p} currentUserId={currentUser?.id ?? ""} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)]">
          Aktive Spieler ({active.length})
        </h2>
        <div className="border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          {active.length === 0 ? (
            <p className="px-6 py-8 text-sm text-[var(--color-muted)] text-center">Keine Spieler.</p>
          ) : (
            active.map((p) => (
              <UserRow key={p.id} profile={p} currentUserId={currentUser?.id ?? ""} />
            ))
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)]">Neuen Spieler anlegen</h2>
        <CreateUserForm />
      </section>
    </div>
  );
}

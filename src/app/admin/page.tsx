import { createClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [{ count: pendingMatches }, { count: pendingUsers }, { count: totalPlayers }] =
    await Promise.all([
      supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_approved", false),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_approved", true),
    ]);

  const stats = [
    { label: "Ausstehende Matches", value: pendingMatches ?? 0, urgent: (pendingMatches ?? 0) > 0 },
    { label: "Freigabe ausstehend", value: pendingUsers ?? 0, urgent: (pendingUsers ?? 0) > 0 },
    { label: "Aktive Spieler", value: totalPlayers ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.4em] uppercase text-[var(--color-muted)]">
        Admin — Übersicht
      </h1>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, urgent }) => (
          <div key={label} className={`border p-5 bg-[var(--color-surface)] ${urgent ? "border-[var(--color-accent)]" : "border-[var(--color-border)]"}`}>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)] mb-2">{label}</p>
            <p className={`font-[family-name:var(--font-cinzel)] text-3xl font-bold ${urgent ? "text-[var(--color-accent)]" : "text-[var(--color-text)]"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
        {[
          { href: "/admin/matches", label: "Matches bestätigen", desc: "Ausstehende Spielergebnisse prüfen und bestätigen" },
          { href: "/admin/users", label: "Spieler verwalten", desc: "Accounts freigeben, anlegen oder löschen" },
          { href: "/admin/reset", label: "Rangliste zurücksetzen", desc: "Alle ELO-Werte und W/L auf Startwert zurücksetzen" },
        ].map(({ href, label, desc }) => (
          <a key={href} href={href} className="flex items-center justify-between px-6 py-4 hover:bg-[var(--color-surface)] transition-colors group">
            <div>
              <p className="text-sm font-[family-name:var(--font-cinzel)] tracking-widest uppercase text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                {label}
              </p>
              <p className="text-xs text-[var(--color-muted)] mt-1">{desc}</p>
            </div>
            <span className="text-[var(--color-muted)] group-hover:text-[var(--color-accent)] transition-colors">→</span>
          </a>
        ))}
      </div>
    </div>
  );
}

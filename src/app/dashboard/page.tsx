import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EloChart } from "@/components/dashboard/EloChart";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: allPlayers }, { data: history }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("profiles").select("id").eq("is_approved", true).order("elo", { ascending: false }),
    supabase.from("elo_history").select("elo, recorded_at").eq("player_id", user.id).order("recorded_at", { ascending: true }),
  ]);

  if (!profile?.is_approved) redirect("/awaiting-approval");

  const rank = (allPlayers?.findIndex((p) => p.id === user.id) ?? -1) + 1;
  const total = allPlayers?.length ?? 0;
  const winRate = profile.wins + profile.losses > 0
    ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100)
    : 0;

  const chartData = (history ?? []).map((h) => ({
    date: new Date(h.recorded_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
    elo: h.elo,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.4em] uppercase text-[var(--color-muted)]">
          Willkommen, {profile.display_name}
        </h1>
        <Link
          href="/dashboard/match/new"
          className="text-xs tracking-widest uppercase bg-[var(--color-accent)] text-[var(--color-primary)] px-4 py-2 font-[family-name:var(--font-cinzel)] font-bold hover:bg-[var(--color-accent-dark)] transition-colors"
        >
          + Match eintragen
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "ELO", value: profile.elo, accent: true },
          { label: "Rang", value: total > 0 ? `#${rank} / ${total}` : "—" },
          { label: "Quote", value: `${winRate}%` },
        ].map(({ label, value, accent }) => (
          <div key={label} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)] mb-2">{label}</p>
            <p className={`font-[family-name:var(--font-cinzel)] text-2xl font-bold ${accent ? "text-[var(--color-accent)]" : "text-[var(--color-text)]"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* W/L */}
      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)] mb-4">Siege / Niederlagen</p>
        <div className="flex gap-8">
          <div>
            <p className="text-3xl font-bold text-[var(--color-accent)] font-[family-name:var(--font-cinzel)]">{profile.wins}</p>
            <p className="text-[10px] tracking-widest uppercase text-[var(--color-muted)] mt-1">Siege</p>
          </div>
          <div className="border-l border-[var(--color-border)]" />
          <div>
            <p className="text-3xl font-bold text-[var(--color-text)] font-[family-name:var(--font-cinzel)]">{profile.losses}</p>
            <p className="text-[10px] tracking-widest uppercase text-[var(--color-muted)] mt-1">Niederlagen</p>
          </div>
        </div>
      </div>

      {/* ELO Chart */}
      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)] mb-4">ELO-Verlauf</p>
        <EloChart data={chartData} startElo={1000} />
      </div>
    </div>
  );
}

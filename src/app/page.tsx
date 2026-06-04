import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

export const revalidate = 60;

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const { data: players } = await supabase
    .from("profiles")
    .select("player_id, display_name, elo, wins, losses")
    .eq("is_approved", true)
    .order("elo", { ascending: false });

  return (
    <main className="min-h-screen px-4 py-10 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <Logo size="md" />
        <Link
          href="/login"
          className="text-xs tracking-widest uppercase text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors border border-[var(--color-border)] hover:border-[var(--color-accent)] px-4 py-2"
        >
          Anmelden
        </Link>
      </header>

      <div className="mb-8">
        <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.4em] uppercase text-[var(--color-muted)] mb-1">
          Globale Rangliste
        </h2>
        <div className="h-px bg-[var(--color-accent)] w-16" />
      </div>

      <div className="border border-[var(--color-border)]">
        <div className="grid grid-cols-[3rem_1fr_6rem_8rem_5rem] px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          {["#", "Spieler", "ELO", "S / N", "Quote"].map((h) => (
            <span key={h} className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)]">
              {h}
            </span>
          ))}
        </div>

        {!players || players.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-[var(--color-muted)] tracking-wide">
            Noch keine Spieler in der Rangliste.
          </div>
        ) : (
          players.map((player, index) => {
            const total = player.wins + player.losses;
            const winRate = total > 0 ? Math.round((player.wins / total) * 100) : 0;

            return (
              <div
                key={player.player_id}
                className="grid grid-cols-[3rem_1fr_6rem_8rem_5rem] px-4 py-3.5 border-b border-[var(--color-border)] last:border-b-0 transition-colors hover:bg-[var(--color-surface)]"
              >
                <span className={`text-sm font-bold tabular-nums ${index === 0 ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"}`}>
                  {index + 1}
                </span>
                <div>
                  <span className="text-sm text-[var(--color-text)] tracking-wide">
                    {player.display_name}
                  </span>
                  <span className="ml-2 text-[10px] text-[var(--color-border)] tracking-widest">
                    {player.player_id}
                  </span>
                </div>
                <span className={`text-sm font-bold tabular-nums ${index < 3 ? "text-[var(--color-accent)]" : "text-[var(--color-text)]"}`}>
                  {player.elo}
                </span>
                <span className="text-sm text-[var(--color-muted)] tabular-nums">
                  {player.wins} / {player.losses}
                </span>
                <span className="text-sm text-[var(--color-muted)] tabular-nums">
                  {winRate}%
                </span>
              </div>
            );
          })
        )}
      </div>

      <footer className="mt-12 text-center text-[10px] tracking-widest uppercase text-[var(--color-border)]">
        Holdfast: Nations at War · ELO-System
      </footer>
    </main>
  );
}

import { createClient } from "@/lib/supabase/server";
import { MatchConfirmRow } from "@/components/admin/MatchConfirmRow";

export default async function AdminMatchesPage() {
  const supabase = await createClient();

  const { data: matches } = await supabase
    .from("matches")
    .select(`
      id, submitted_at, winner_id,
      player1:player1_id(id, display_name, player_id, elo),
      player2:player2_id(id, display_name, player_id, elo),
      submitter:submitted_by(display_name)
    `)
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.4em] uppercase text-[var(--color-muted)]">
        Ausstehende Matches
      </h1>

      {!matches || matches.length === 0 ? (
        <div className="border border-[var(--color-border)] px-6 py-12 text-center text-sm text-[var(--color-muted)] tracking-wide">
          Keine ausstehenden Matches.
        </div>
      ) : (
        <div className="border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          {matches.map((match) => (
            <MatchConfirmRow key={match.id} match={match as never} />
          ))}
        </div>
      )}
    </div>
  );
}

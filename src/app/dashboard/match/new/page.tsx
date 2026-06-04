"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { submitMatch } from "@/lib/actions/matches";
import { Button } from "@/components/ui/Button";

interface Player {
  id: string;
  display_name: string;
  player_id: string;
  elo: number;
}

// Immer 5 Runden gespielt, Gewinner braucht Mehrheit
const ALL_SCORES = [
  { w: 5, l: 0 },
  { w: 4, l: 1 },
  { w: 3, l: 2 },
];

export default function NewMatchPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [opponentId, setOpponentId] = useState("");
  const [winnerId, setWinnerId] = useState("");
  const [score, setScore] = useState<{ w: number; l: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setCurrentUserId(user.id);
      supabase
        .from("profiles")
        .select("id, display_name, player_id, elo")
        .eq("is_approved", true)
        .neq("id", user.id)
        .order("display_name")
        .then(({ data }) => setPlayers(data ?? []));
    });
  }, []);

  const opponent = players.find((p) => p.id === opponentId);

  // Zeige Endstand aus Sicht des eingeloggten Spielers
  function displayScore(s: { w: number; l: number }) {
    return winnerId === currentUserId
      ? `${s.w} : ${s.l}`
      : `${s.l} : ${s.w}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = await submitMatch(form);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  const canSubmit = opponentId && winnerId && score !== null;

  return (
    <div className="max-w-lg">
      <h1 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.4em] uppercase text-[var(--color-muted)] mb-8">
        Match eintragen
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hidden score fields */}
        <input type="hidden" name="winner_rounds" value={score?.w ?? ""} />
        <input type="hidden" name="loser_rounds" value={score?.l ?? ""} />

        {/* Gegner */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs tracking-widest uppercase text-[var(--color-muted)]">Gegner</label>
          <select
            name="opponent_id"
            value={opponentId}
            onChange={(e) => { setOpponentId(e.target.value); setWinnerId(""); setScore(null); }}
            required
            className="bg-[var(--color-primary)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-2.5 outline-none focus:border-[var(--color-accent)] transition-colors appearance-none"
          >
            <option value="">— Gegner auswählen —</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.display_name} ({p.player_id}) · ELO {p.elo}
              </option>
            ))}
          </select>
        </div>

        {/* Gewinner */}
        {opponentId && (
          <div className="flex flex-col gap-3">
            <label className="text-xs tracking-widest uppercase text-[var(--color-muted)]">Gewinner</label>
            <input type="hidden" name="winner_id" value={winnerId} />
            {[
              { id: currentUserId, label: "Ich habe gewonnen" },
              { id: opponentId, label: `${opponent?.display_name} hat gewonnen` },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => { setWinnerId(id); setScore(null); }}
                className={`px-4 py-3 text-sm tracking-wide border text-left transition-colors ${
                  winnerId === id
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-primary)] font-bold"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Endstand */}
        {winnerId && (
          <div className="flex flex-col gap-3">
            <label className="text-xs tracking-widest uppercase text-[var(--color-muted)]">
              Endstand (Ich : Gegner)
            </label>
            <div className="flex gap-2">
              {ALL_SCORES.map((s) => (
                <button
                  key={`${s.w}:${s.l}`}
                  type="button"
                  onClick={() => setScore(s)}
                  className={`flex-1 py-3 text-sm font-bold border transition-colors font-[family-name:var(--font-cinzel)] ${
                    score?.w === s.w && score?.l === s.l
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-primary)]"
                      : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {displayScore(s)}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}

        <div className="flex gap-4 pt-2">
          <Button type="submit" loading={loading} disabled={!canSubmit}>
            Einreichen
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Abbrechen
          </Button>
        </div>

        <p className="text-[11px] text-[var(--color-muted)] leading-relaxed border border-[var(--color-border)] p-3">
          Das Match wird erst nach Bestätigung durch einen Admin in die Wertung aufgenommen.
        </p>
      </form>
    </div>
  );
}

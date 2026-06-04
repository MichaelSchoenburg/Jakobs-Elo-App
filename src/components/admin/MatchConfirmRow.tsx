"use client";

import { useState } from "react";
import { confirmMatch } from "@/lib/actions/matches";
import { Button } from "@/components/ui/Button";

interface Player { id: string; display_name: string; player_id: string; elo: number; }
interface Match {
  id: string;
  submitted_at: string;
  winner_id: string;
  player1: Player;
  player2: Player;
  submitter: { display_name: string };
}

export function MatchConfirmRow({ match }: { match: Match }) {
  const [correctedWinner, setCorrectedWinner] = useState(match.winner_id);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await confirmMatch(match.id, correctedWinner);
    setDone(true);
  }

  if (done) return null;

  const date = new Date(match.submitted_at).toLocaleDateString("de-DE");

  return (
    <div className="px-6 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className={`font-medium ${correctedWinner === match.player1.id ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"}`}>
            {match.player1.display_name}
            <span className="ml-1.5 text-[10px] text-[var(--color-border)]">{match.player1.player_id}</span>
          </span>
          <span className="text-[var(--color-border)] text-xs">vs</span>
          <span className={`font-medium ${correctedWinner === match.player2.id ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"}`}>
            {match.player2.display_name}
            <span className="ml-1.5 text-[10px] text-[var(--color-border)]">{match.player2.player_id}</span>
          </span>
        </div>
        <span className="text-[10px] text-[var(--color-muted)] tracking-wide">
          {date} · von {match.submitter.display_name}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[10px] tracking-widest uppercase text-[var(--color-muted)]">Gewinner:</span>
        {[match.player1, match.player2].map((p) => (
          <button
            key={p.id}
            onClick={() => setCorrectedWinner(p.id)}
            className={`px-3 py-1.5 text-xs tracking-wide border transition-colors ${
              correctedWinner === p.id
                ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-primary)] font-bold"
                : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
            }`}
          >
            {p.display_name}
          </button>
        ))}
        <Button onClick={handleConfirm} loading={loading} className="ml-auto">
          Bestätigen
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { confirmMatch } from "@/lib/actions/matches";
import { Button } from "@/components/ui/Button";

interface Player { id: string; display_name: string; player_id: string; elo: number; }
interface Match {
  id: string;
  submitted_at: string;
  winner_id: string;
  player1_rounds: number | null;
  player2_rounds: number | null;
  player1: Player;
  player2: Player;
  submitter: { display_name: string };
}

// Best of Five: First to 3 wins — Gewinner hat immer 3
const ALL_SCORES = [
  { w: 3, l: 0 },
  { w: 3, l: 1 },
  { w: 3, l: 2 },
];

export function MatchConfirmRow({ match }: { match: Match }) {
  const [correctedWinner, setCorrectedWinner] = useState(match.winner_id);
  const [score, setScore] = useState<{ w: number; l: number }>(() => {
    const winnerIsP1 = match.winner_id === match.player1.id;
    return {
      w: winnerIsP1 ? (match.player1_rounds ?? 3) : (match.player2_rounds ?? 3),
      l: winnerIsP1 ? (match.player2_rounds ?? 0) : (match.player1_rounds ?? 0),
    };
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await confirmMatch(match.id, correctedWinner, score.w, score.l);
    setDone(true);
  }

  if (done) return null;

  const date = new Date(match.submitted_at).toLocaleDateString("de-DE");
  const winner = correctedWinner === match.player1.id ? match.player1 : match.player2;
  const loser = correctedWinner === match.player1.id ? match.player2 : match.player1;

  return (
    <div className="px-6 py-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className={`font-medium ${correctedWinner === match.player1.id ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"}`}>
            {match.player1.display_name}
            <span className="ml-1.5 text-[10px] text-[var(--color-border)]">{match.player1.player_id}</span>
          </span>
          <span className="text-[var(--color-border)] text-xs font-bold">vs</span>
          <span className={`font-medium ${correctedWinner === match.player2.id ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"}`}>
            {match.player2.display_name}
            <span className="ml-1.5 text-[10px] text-[var(--color-border)]">{match.player2.player_id}</span>
          </span>
        </div>
        <span className="text-[10px] text-[var(--color-muted)] tracking-wide">
          {date} · von {match.submitter.display_name}
        </span>
      </div>

      {/* Gewinner */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] tracking-widest uppercase text-[var(--color-muted)] w-20">Gewinner:</span>
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
      </div>

      {/* Endstand */}
      <div className="space-y-1">
        <span className="text-[10px] tracking-widest uppercase text-[var(--color-muted)] block mb-2">
          Endstand ({winner.display_name} : {loser.display_name}):
        </span>
        <div className="flex gap-2">
          {ALL_SCORES.map((s) => (
            <button
              key={`${s.w}:${s.l}`}
              onClick={() => setScore(s)}
              className={`flex-1 py-1.5 text-xs font-bold border transition-colors font-[family-name:var(--font-cinzel)] ${
                score.w === s.w && score.l === s.l
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-primary)]"
                  : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
              }`}
            >
              {s.w} : {s.l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleConfirm} loading={loading}>
          Bestätigen
        </Button>
      </div>
    </div>
  );
}

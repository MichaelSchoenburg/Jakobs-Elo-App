"use client";

import { useState } from "react";
import { resetRanking } from "@/lib/actions/users";
import { Button } from "@/components/ui/Button";

export default function AdminResetPage() {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleReset() {
    setLoading(true);
    await resetRanking();
    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="max-w-md space-y-6">
        <h1 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.4em] uppercase text-[var(--color-muted)]">
          Rangliste zurücksetzen
        </h1>
        <div className="border border-[var(--color-accent)] p-6 text-center">
          <p className="text-sm text-[var(--color-accent)] tracking-wide">
            Rangliste wurde zurückgesetzt. Alle ELO-Werte stehen wieder auf 1000.
          </p>
        </div>
        <a href="/admin" className="text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)] tracking-widest uppercase">
          ← Zurück zur Übersicht
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-6">
      <h1 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.4em] uppercase text-[var(--color-muted)]">
        Rangliste zurücksetzen
      </h1>

      <div className="border border-[var(--color-danger)] p-6 space-y-4">
        <p className="text-sm text-[var(--color-text)] leading-relaxed">
          Diese Aktion setzt <strong>alle ELO-Werte</strong> auf 1000 und alle <strong>Siege/Niederlagen</strong> auf 0 zurück.
          Die Match-Historie bleibt erhalten.
        </p>
        <p className="text-xs text-[var(--color-danger)] tracking-wide font-bold uppercase">
          Diese Aktion kann nicht rückgängig gemacht werden.
        </p>

        {!confirmed ? (
          <Button variant="danger" onClick={() => setConfirmed(true)}>
            Ich verstehe — weiter
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[var(--color-text)] tracking-wide">Wirklich zurücksetzen?</p>
            <div className="flex gap-3">
              <Button variant="danger" onClick={handleReset} loading={loading}>
                Ja, Rangliste zurücksetzen
              </Button>
              <Button variant="ghost" onClick={() => setConfirmed(false)}>
                Abbrechen
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

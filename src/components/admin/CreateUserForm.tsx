"use client";

import { useState } from "react";
import { createUser } from "@/lib/actions/users";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function CreateUserForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const result = await createUser(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  }

  return (
    <div className="border border-[var(--color-border)] p-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4 items-end">
        <Input label="Anzeigename" name="display_name" required minLength={2} />
        <Input label="E-Mail" name="email" type="email" required />
        <Input label="Passwort" name="password" type="password" required minLength={8} />
        <div className="col-span-3 flex items-center gap-4">
          <Button type="submit" loading={loading}>Spieler anlegen</Button>
          {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
          {success && <p className="text-xs text-[var(--color-accent)] tracking-wide">Spieler angelegt.</p>}
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signUp } from "@/lib/actions/auth";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    if (form.get("password") !== form.get("password_confirm")) {
      setError("Passwörter stimmen nicht überein.");
      setLoading(false);
      return;
    }

    const result = await signUp(form);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(180deg, var(--color-bg) 0%, var(--color-surface) 100%)" }}>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <Logo size="lg" />
          <p className="mt-3 text-xs tracking-widest text-[var(--color-muted)] uppercase">
            Nations at War — Rangliste
          </p>
        </div>

        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
          <h1 className="font-[family-name:var(--font-cinzel)] text-sm tracking-[0.3em] uppercase text-[var(--color-muted)] mb-6">
            Registrierung
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Anzeigename"
              name="display_name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={32}
            />
            <Input
              label="E-Mail"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            <Input
              label="Passwort"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
            <Input
              label="Passwort bestätigen"
              name="password_confirm"
              type="password"
              autoComplete="new-password"
              required
            />

            {error && (
              <p className="text-xs text-[var(--color-danger)] tracking-wide">{error}</p>
            )}

            <div className="border border-[var(--color-border)] p-3 mt-1">
              <p className="text-[11px] text-[var(--color-muted)] leading-relaxed tracking-wide">
                Nach der Registrierung muss ein Admin deinen Account freigeben,
                bevor du dich einloggen kannst.
              </p>
            </div>

            <Button type="submit" loading={loading} className="mt-2 w-full justify-center">
              Registrieren
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-[var(--color-muted)] tracking-wide">
          Bereits registriert?{" "}
          <Link href="/login" className="text-[var(--color-accent)] hover:underline">
            Anmelden
          </Link>
        </p>
      </motion.div>
    </main>
  );
}

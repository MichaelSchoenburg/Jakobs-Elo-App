"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signIn } from "@/lib/actions/auth";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn(new FormData(e.currentTarget));
    if (result?.error) {
      setError("Ungültige Anmeldedaten.");
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
            Anmeldung
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
              autoComplete="current-password"
              required
            />

            {error && (
              <p className="text-xs text-[var(--color-danger)] tracking-wide">{error}</p>
            )}

            <Button type="submit" loading={loading} className="mt-2 w-full justify-center">
              Einloggen
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-[var(--color-muted)] tracking-wide">
          Noch kein Account?{" "}
          <Link href="/register" className="text-[var(--color-accent)] hover:underline">
            Registrieren
          </Link>
        </p>

        <div className="mt-8 border-t border-[var(--color-border)] pt-4">
          <p className="text-center text-[10px] tracking-widest uppercase text-[var(--color-border)]">
            Holdfast: Nations at War · ELO-System
          </p>
        </div>
      </motion.div>
    </main>
  );
}

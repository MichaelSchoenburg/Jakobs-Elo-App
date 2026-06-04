import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

export default function AwaitingApprovalPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(180deg, var(--color-bg) 0%, var(--color-surface) 100%)" }}>

      <div className="w-full max-w-sm text-center">
        <Logo size="lg" />

        <div className="mt-10 border border-[var(--color-accent)] bg-[var(--color-surface)] p-8">
          <div className="text-[var(--color-accent)] text-4xl mb-4">⏳</div>
          <h1 className="font-[family-name:var(--font-cinzel)] text-lg font-bold tracking-widest uppercase text-[var(--color-text)] mb-4">
            Freigabe ausstehend
          </h1>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed tracking-wide">
            Dein Account wurde registriert und wartet auf die Freigabe durch einen Admin.
            Du wirst benachrichtigt, sobald dein Zugang aktiviert wurde.
          </p>
        </div>

        <p className="mt-6 text-xs text-[var(--color-muted)] tracking-wide">
          Bereits freigeschaltet?{" "}
          <Link href="/login" className="text-[var(--color-accent)] hover:underline">
            Erneut anmelden
          </Link>
        </p>
      </div>
    </main>
  );
}

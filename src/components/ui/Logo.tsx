export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className={`font-[family-name:var(--font-cinzel)] font-black tracking-[0.2em] uppercase ${sizes[size]}`}>
      <span className="text-[var(--color-accent)]">Holdfast</span>
      <span className="text-[var(--color-muted)] mx-2 font-light">·</span>
      <span className="text-[var(--color-text)]">ELO</span>
    </div>
  );
}

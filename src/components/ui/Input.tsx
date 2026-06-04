import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs tracking-widest uppercase text-[var(--color-muted)]">
        {label}
      </label>
      <input
        ref={ref}
        className={`bg-[var(--color-primary)] border text-[var(--color-text)] px-4 py-2.5 outline-none transition-colors
          ${error ? "border-[var(--color-danger)]" : "border-[var(--color-border)] focus:border-[var(--color-accent)]"}
          ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-[var(--color-danger)]">{error}</span>
      )}
    </div>
  )
);

Input.displayName = "Input";

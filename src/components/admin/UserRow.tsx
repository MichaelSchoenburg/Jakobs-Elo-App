"use client";

import { useState } from "react";
import { approveUser, deleteUser } from "@/lib/actions/users";
import { Button } from "@/components/ui/Button";

interface Profile {
  id: string;
  display_name: string;
  player_id: string;
  elo: number;
  wins: number;
  losses: number;
  is_approved: boolean;
  is_admin: boolean;
}

export function UserRow({ profile, currentUserId }: { profile: Profile; currentUserId: string }) {
  const [loading, setLoading] = useState<"approve" | "delete" | null>(null);
  const [removed, setRemoved] = useState(false);
  const isSelf = profile.id === currentUserId;

  if (removed) return null;

  async function handleApprove() {
    setLoading("approve");
    await approveUser(profile.id);
    setLoading(null);
  }

  async function handleDelete() {
    if (!confirm(`Spieler "${profile.display_name}" wirklich löschen?`)) return;
    setLoading("delete");
    await deleteUser(profile.id);
    setRemoved(true);
  }

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-4">
        <span className="text-[10px] text-[var(--color-border)] tracking-widest w-16">{profile.player_id}</span>
        <span className="text-sm text-[var(--color-text)]">{profile.display_name}</span>
        {profile.is_admin && (
          <span className="text-[10px] tracking-widest uppercase text-[var(--color-accent)] border border-[var(--color-accent)] px-2 py-0.5">
            Admin
          </span>
        )}
        {isSelf && (
          <span className="text-[10px] tracking-widest uppercase text-[var(--color-muted)] border border-[var(--color-border)] px-2 py-0.5">
            Du
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {profile.is_approved && (
          <span className="text-xs text-[var(--color-muted)] tabular-nums">
            ELO {profile.elo} · {profile.wins}S {profile.losses}N
          </span>
        )}
        <div className="flex gap-2">
          {!profile.is_approved && (
            <Button onClick={handleApprove} loading={loading === "approve"} className="text-xs py-1.5 px-3">
              Freigeben
            </Button>
          )}
          {!isSelf && (
            <Button onClick={handleDelete} loading={loading === "delete"} variant="danger" className="text-xs py-1.5 px-3">
              Löschen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

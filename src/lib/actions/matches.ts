"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { calculateElo } from "@/lib/elo";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitMatch(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const opponentId = formData.get("opponent_id") as string;
  const winnerId = formData.get("winner_id") as string;
  const loserRounds = parseInt(formData.get("loser_rounds") as string);

  if (!opponentId || !winnerId || isNaN(loserRounds)) {
    return { error: "Alle Felder ausfüllen." };
  }

  // Gewinner hat immer 3, Verlierer 0-2
  const player1Rounds = winnerId === user.id ? 3 : loserRounds;
  const player2Rounds = winnerId === user.id ? loserRounds : 3;

  const { error } = await supabase.from("matches").insert({
    player1_id: user.id,
    player2_id: opponentId,
    winner_id: winnerId,
    player1_rounds: player1Rounds,
    player2_rounds: player2Rounds,
    submitted_by: user.id,
  });

  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function confirmMatch(
  matchId: string,
  correctedWinnerId?: string,
  correctedLoserRounds?: number
) {
  const supabase = await createClient();
  const adminClient = await createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const { data: match } = await adminClient
    .from("matches")
    .select("*, player1:player1_id(id, elo), player2:player2_id(id, elo)")
    .eq("id", matchId)
    .eq("status", "pending")
    .single();

  if (!match) return { error: "Match nicht gefunden." };

  const effectiveWinnerId = correctedWinnerId ?? match.winner_id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const player1 = (match as any).player1 as { id: string; elo: number };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const player2 = (match as any).player2 as { id: string; elo: number };

  // Runden bestimmen — Korrektur überschreibt eingereichte Werte
  let p1Rounds = match.player1_rounds ?? 3;
  let p2Rounds = match.player2_rounds ?? 0;

  if (correctedLoserRounds !== undefined) {
    if (effectiveWinnerId === player1.id) {
      p1Rounds = 3;
      p2Rounds = correctedLoserRounds;
    } else {
      p1Rounds = correctedLoserRounds;
      p2Rounds = 3;
    }
  } else if (correctedWinnerId) {
    // Gewinner geändert, Runden beibehalten aber Seiten tauschen
    const prevLoserRounds = effectiveWinnerId === player1.id ? p2Rounds : p1Rounds;
    p1Rounds = effectiveWinnerId === player1.id ? 3 : prevLoserRounds;
    p2Rounds = effectiveWinnerId === player2.id ? 3 : prevLoserRounds;
  }

  const { newRatingA, newRatingB, deltaA, deltaB } = calculateElo(
    player1.elo, player2.elo, p1Rounds, p2Rounds
  );

  await adminClient.from("matches").update({
    status: "confirmed",
    winner_id: effectiveWinnerId,
    player1_rounds: p1Rounds,
    player2_rounds: p2Rounds,
    player1_elo_before: player1.elo,
    player2_elo_before: player2.elo,
    player1_elo_after: newRatingA,
    player2_elo_after: newRatingB,
    confirmed_by: user.id,
    confirmed_at: new Date().toISOString(),
  }).eq("id", matchId);

  await adminClient.rpc("confirm_match_stats", {
    p1_id: player1.id,
    p2_id: player2.id,
    p1_elo: newRatingA,
    p2_elo: newRatingB,
    winner: effectiveWinnerId,
  });

  await adminClient.from("elo_history").insert([
    { player_id: player1.id, elo: newRatingA, delta: deltaA, match_id: matchId },
    { player_id: player2.id, elo: newRatingB, delta: deltaB, match_id: matchId },
  ]);

  revalidatePath("/admin/matches");
  revalidatePath("/dashboard");
  revalidatePath("/");
  return { success: true };
}

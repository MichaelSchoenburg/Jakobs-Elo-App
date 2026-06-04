const K = 16;

export function calculateElo(ratingA: number, ratingB: number, winnerId: "A" | "B") {
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const expectedB = 1 - expectedA;

  const scoreA = winnerId === "A" ? 1 : 0;
  const scoreB = winnerId === "B" ? 1 : 0;

  return {
    newRatingA: Math.round(ratingA + K * (scoreA - expectedA)),
    newRatingB: Math.round(ratingB + K * (scoreB - expectedB)),
    deltaA: Math.round(K * (scoreA - expectedA)),
    deltaB: Math.round(K * (scoreB - expectedB)),
  };
}

const K = 16;

export function calculateElo(
  ratingA: number,
  ratingB: number,
  roundsA: number,
  roundsB: number
) {
  const total = roundsA + roundsB;
  const scoreA = roundsA / total;
  const scoreB = roundsB / total;

  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const expectedB = 1 - expectedA;

  return {
    newRatingA: Math.round(ratingA + K * (scoreA - expectedA)),
    newRatingB: Math.round(ratingB + K * (scoreB - expectedB)),
    deltaA: Math.round(K * (scoreA - expectedA)),
    deltaB: Math.round(K * (scoreB - expectedB)),
  };
}

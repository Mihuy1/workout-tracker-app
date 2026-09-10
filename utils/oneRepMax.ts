export function estimateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight;

  return weight * (1 + reps / 30);
}

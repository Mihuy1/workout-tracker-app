export type WeightUnit = "kg" | "lb";

const GRAMS_PER_UNIT = {
  kg: 1000,
  lb: 453.59237,
};

export const WEIGHT_UNIT_OPTIONS = [
  { value: "kg", label: "Kilograms" },
  { value: "lb", label: "Pounds" },
] satisfies { value: WeightUnit; label: string }[];

export function weightToGrams(value: number, unit: WeightUnit): number {
  return Math.round(value * GRAMS_PER_UNIT[unit]);
}

export function gramsToWeight(grams: number, unit: WeightUnit): number {
  return grams / GRAMS_PER_UNIT[unit];
}

export function formatWeightValue(grams: number, unit: WeightUnit): string {
  const value = gramsToWeight(grams, unit);

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: unit === "kg" ? 2 : 1,
  }).format(value);
}

export function formatWeight(grams: number, unit: WeightUnit): string {
  return `${formatWeightValue(grams, unit)} ${unit}`;
}

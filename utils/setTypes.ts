import type { SetType } from "@/types/workout";

export const DEFAULT_SET_TYPE: SetType = "normal";

export const SET_TYPE_OPTIONS: readonly { value: SetType; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "warmup", label: "Warmup" },
  { value: "dropset", label: "Drop set" },
  { value: "failure", label: "Failure" },
];

const SET_TYPE_SHORT_LABELS: Record<Exclude<SetType, "normal">, string> = {
  warmup: "W",
  dropset: "D",
  failure: "F",
};

const SET_TYPE_COLORS: Record<Exclude<SetType, "normal">, string> = {
  warmup: "#F59E0B",
  dropset: "#8B5CF6",
  failure: "#EF4444",
};

export function isSetType(value: unknown): value is SetType {
  return SET_TYPE_OPTIONS.some((option) => option.value === value);
}

/** Falls back to a normal set for missing or unknown stored values. */
export function toSetType(value: unknown): SetType {
  return isSetType(value) ? value : DEFAULT_SET_TYPE;
}

/** Normal sets show their number; other types show a letter. */
export function getSetLabel(type: SetType, setNumber: number): string {
  return type === "normal" ? String(setNumber) : SET_TYPE_SHORT_LABELS[type];
}

/** Accent color for special set types; undefined for normal sets. */
export function getSetTypeColor(type: SetType): string | undefined {
  return type === "normal" ? undefined : SET_TYPE_COLORS[type];
}

/** Reads the per-set types stored on a routine exercise (JSON array). */
export function parseSetTypes(json: string | null, setCount: number): SetType[] {
  let stored: unknown = null;

  if (json) {
    try {
      stored = JSON.parse(json);
    } catch {
      stored = null;
    }
  }

  const list = Array.isArray(stored) ? stored : [];

  return Array.from({ length: setCount }, (_, index) => toSetType(list[index]));
}

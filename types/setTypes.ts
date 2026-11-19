import { SetType } from "@/types/workout";

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

export function getSetLabel(type: SetType, setNumber: number) {
  return type === "normal" ? String(setNumber) : SET_TYPE_SHORT_LABELS[type];
}

export function getSetColor(type: SetType) {
  return type === "normal" ? undefined : SET_TYPE_COLORS[type];
}

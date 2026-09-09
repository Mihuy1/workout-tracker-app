import { WeightUnit } from "@/utils/weightUnits";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WEIGHT_UNIT_KEY = "preferences.weightUnit";
const DEFAULT_REST_TIME_KEY = "preferences.defaultRestTime";

const FALLBACK_DEFAULT_REST_SECONDS = 120;

export async function getWeightUnit(): Promise<WeightUnit> {
  const saved = await AsyncStorage.getItem(WEIGHT_UNIT_KEY);
  return saved === "lb" ? "lb" : "kg";
}

export async function saveWeightUnit(unit: WeightUnit): Promise<void> {
  await AsyncStorage.setItem(WEIGHT_UNIT_KEY, unit);
}

export async function getDefaultRestTime(): Promise<number> {
  const saved = await AsyncStorage.getItem(DEFAULT_REST_TIME_KEY);
  return saved ? Number(saved) : FALLBACK_DEFAULT_REST_SECONDS;
}

export async function saveDefaultRestTime(restTime: number): Promise<void> {
  await AsyncStorage.setItem(DEFAULT_REST_TIME_KEY, String(restTime));
}

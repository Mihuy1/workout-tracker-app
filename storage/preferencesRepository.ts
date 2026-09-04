import { WeightUnit } from "@/utils/weightUnits";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WEIGHT_UNIT_KEY = "preferences.weightUnit";

export async function getWeightUnit(): Promise<WeightUnit> {
  const saved = await AsyncStorage.getItem(WEIGHT_UNIT_KEY);
  return saved === "lb" ? "lb" : "kg";
}

export async function saveWeightUnit(unit: WeightUnit): Promise<void> {
  await AsyncStorage.setItem(WEIGHT_UNIT_KEY, unit);
}

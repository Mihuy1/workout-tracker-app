import { View } from "react-native";
import { ThemedText } from "../themed-text";
import { CustomButton } from "./customButton";

export interface ExercisePickerRowItem {
  id: string;
  name: string;
  mechanic: string | null;
}

interface ExercisePickerRowProps {
  item: ExercisePickerRowItem;
  onAdd: (item: ExercisePickerRowItem) => void;
}

export function ExercisePickerRow({ item, onAdd }: ExercisePickerRowProps) {
  return (
    <View>
      <ThemedText>{item.name}</ThemedText>
      <ThemedText>{item.mechanic}</ThemedText>

      <CustomButton title="Add Exercise" onPress={() => onAdd(item)} />
    </View>
  );
}

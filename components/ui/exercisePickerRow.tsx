import { useThemeColor } from "@/hooks/use-theme-color";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";
import { IconSymbol } from "./icon-symbol";

export interface ExercisePickerRowItem {
  id: string;
  name: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  category: string;
}

interface ExercisePickerRowProps {
  item: ExercisePickerRowItem;
  onAdd: (item: ExercisePickerRowItem) => void;
  disabled: boolean;
}

export function ExercisePickerRow({
  item,
  onAdd,
  disabled,
}: ExercisePickerRowProps) {
  const surface = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");
  const mutedText = useThemeColor({}, "mutedText");
  const accent = useThemeColor({}, "barColor");
  const avatarBackground = useThemeColor({}, "surfaceMuted");
  const metadata = [
    formatLabel(item.primaryMuscles[0]),
    formatEquipment(item.equipment),
    formatLabel(item.mechanic ?? item.category),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onAdd(item);
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Add ${item.name}`}
      accessibilityHint={metadata}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: surface, borderColor },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: avatarBackground }]}>
        <ThemedText style={[styles.avatarText, { color: accent }]}>
          {getInitials(item.primaryMuscles[0] ?? item.name)}
        </ThemedText>
      </View>

      <View style={styles.copy}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>
          {item.name}
        </ThemedText>
        <ThemedText
          numberOfLines={1}
          style={[styles.metadata, { color: mutedText }]}
        >
          {metadata}
        </ThemedText>
      </View>

      <View accessible={false} style={styles.addIcon}>
        <IconSymbol name="plus.circle.fill" size={30} color={accent} />
      </View>
    </Pressable>
  );
}

function formatLabel(value?: string | null) {
  if (!value) return null;

  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatEquipment(value?: string | null) {
  if (!value) return null;

  const normalized: Record<string, string> = {
    "body only": "Bodyweight",
    kettlebells: "Kettlebell",
    "e-z curl bar": "EZ Curl Bar",
  };

  return normalized[value] ?? formatLabel(value);
}

function getInitials(value: string) {
  return value
    .split(/[\s/-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const styles = StyleSheet.create({
  row: {
    minHeight: 74,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pressed: {
    opacity: 0.62,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  metadata: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 1,
  },
  addIcon: {
    width: 36,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});

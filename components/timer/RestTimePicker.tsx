import { CustomButton } from "@/components/ui/CustomButton";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/theme";
import { DEFAULT_REST_TIME_OPTIONS } from "@/contexts/restTimePreferenceContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import CustomDropdown from "../CustomDropdown";
import { ThemedText } from "../ui/ThemedText";

interface RestTimePickerProps {
  restTime: number;
  setRestTime: (time: number) => void;
  iconColor?: string;
}

export const RestTimePicker = ({
  restTime,
  setRestTime,
  iconColor,
}: RestTimePickerProps) => {
  const theme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[theme];
  const defaultIconColor = useThemeColor({}, "tint");
  const chipBackground = useThemeColor({}, "chipBackground");
  const chipBorder = useThemeColor({}, "chipBorder");

  const [showPicker, setShowPicker] = useState(false);

  const handleOpen = () => setShowPicker(true);
  const resolvedColor = iconColor ?? defaultIconColor;

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Pressable
        hitSlop={8}
        onPress={handleOpen}
        style={({ pressed }) => [
          styles.chip,
          {
            backgroundColor: chipBackground,
            borderColor: chipBorder,
            opacity: pressed ? 0.6 : 1,
          },
        ]}
      >
        <IconSymbol name="timer" color={resolvedColor} />
        <ThemedText style={{ color: resolvedColor }}>
          {Math.floor(restTime / 60)}m {restTime % 60}s
        </ThemedText>
      </Pressable>
      <Modal
        onRequestClose={() => setShowPicker(false)}
        visible={showPicker}
        animationType="fade"
        transparent
      >
        <Pressable
          style={[styles.backdrop]}
          onPress={() => setShowPicker(false)}
        >
          <Pressable
            style={[styles.modalView, { backgroundColor: colors.background }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.inputsView}>
              <CustomDropdown
                options={DEFAULT_REST_TIME_OPTIONS}
                value={restTime}
                onSelect={(option) => setRestTime(Number(option))}
                style="wheel"
              />
            </View>
            <CustomButton title="Done" onPress={() => setShowPicker(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    width: "88%",
    maxWidth: 420,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    gap: 12,
  },
  inputsView: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

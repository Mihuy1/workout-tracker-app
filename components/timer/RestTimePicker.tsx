import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
  Button,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

interface RestTimePickerProps {
  restTime: number;
  setRestTime: (time: number) => void;
}

export const RestTimePicker = ({
  restTime,
  setRestTime,
}: RestTimePickerProps) => {
  const theme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[theme];

  const [seconds, setSeconds] = useState(() => (restTime % 60).toString());
  const [minutes, setMinutes] = useState(() =>
    Math.floor(restTime / 60).toString(),
  );
  const [showPicker, setShowPicker] = useState(false);

  const handleNumberInput = (text: string) => {
    const integersOnly = text.replace(/[^0-9]/g, "");

    setMinutes(integersOnly);
  };

  const handleSecondsInput = (text: string) => {
    const integersOnly = text.replace(/[^0-9]/g, "");

    setSeconds(integersOnly);
  };

  const handleOpen = () => {
    setMinutes(Math.floor(restTime / 60).toString());
    setSeconds((restTime % 60).toString());
    setShowPicker(true);
  };

  const handleApply = () => {
    const minutesValue = Number(minutes || 0);
    const secondsValue = Number(seconds || 0);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRestTime(minutesValue * 60 + secondsValue);
    setShowPicker(false);
  };

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Pressable hitSlop={10} onPress={handleOpen}>
        <IconSymbol name="timer" color={useThemeColor({}, "iconColor")} />
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
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                keyboardType="numeric"
                value={minutes}
                onChangeText={(text) => handleNumberInput(text)}
                autoFocus
              />
              <Text style={[styles.text, { color: colors.text }]}>Min</Text>

              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                keyboardType="numeric"
                value={seconds}
                onChangeText={(text) => handleSecondsInput(text)}
              />
              <Text style={[styles.text, { color: colors.text }]}>Sec</Text>
            </View>
            <Button title="Apply" onPress={handleApply} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalView: {
    margin: 20,
    // backgroundColor: "white",
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

  textInput: {
    borderWidth: 1,
    // borderColor: "#ccc",
    // backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  text: {
    margin: 0,
    padding: 0,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});

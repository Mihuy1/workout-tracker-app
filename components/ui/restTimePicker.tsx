import { useThemeColor } from "@/hooks/use-theme-color";
import { useState } from "react";
import {
  Button,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { IconSymbol } from "./icon-symbol";

interface RestTimePickerProps {
  restTime: number;
  setRestTime: (time: number) => void;
}

export const RestTimePicker = ({
  restTime,
  setRestTime,
}: RestTimePickerProps) => {
  const [seconds, setSeconds] = useState(() => (restTime % 60).toString());
  const [minutes, setMinutes] = useState(() =>
    Math.floor(restTime / 60).toString(),
  );
  const [showPicker, setShowPicker] = useState(false);

  const overlay = useThemeColor({}, "overlay");
  const surface = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const inputBackground = useThemeColor({}, "inputBackground");
  const borderColor = useThemeColor({}, "border");
  const iconColor = useThemeColor({}, "icon");
  const primaryColor = useThemeColor({}, "primary");

  // useEffect(() => {
  //   setSeconds((restTime % 60).toString());
  //   setMinutes(Math.floor(restTime / 60).toString());
  // }, [restTime]);

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
      <Pressable onPress={handleOpen}>
        <IconSymbol name="timer" color={iconColor} />
      </Pressable>
      <Modal
        onRequestClose={() => setShowPicker(false)}
        visible={showPicker}
        animationType="fade"
        transparent
      >
        <Pressable
          style={[styles.backdrop, { backgroundColor: overlay }]}
          onPress={() => setShowPicker(false)}
        >
          <Pressable
            style={[styles.modalView, { backgroundColor: surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.inputsView}>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: inputBackground,
                    borderColor,
                    color: textColor,
                  },
                ]}
                keyboardType="numeric"
                value={minutes}
                onChangeText={(text) => handleNumberInput(text)}
                autoFocus
              />
              <Text style={[styles.text, { color: textColor }]}>Min</Text>

              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: inputBackground,
                    borderColor,
                    color: textColor,
                  },
                ]}
                keyboardType="numeric"
                value={seconds}
                onChangeText={(text) => handleSecondsInput(text)}
              />
              <Text style={[styles.text, { color: textColor }]}>Sec</Text>
            </View>
            <Button title="Apply" onPress={handleApply} color={primaryColor} />
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

  textInput: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  text: {
    margin: 0,
    padding: 0,
  },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

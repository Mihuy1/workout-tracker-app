import { useState } from "react";
import {
  Button,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
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

  const handleApply = () => {
    const m = parseInt(minutes) * 60;
    const s = parseInt(seconds);
    const sum = m + s;
    setRestTime(sum);

    setShowPicker(false);
  };

  return (
    <View
      style={{
        backgroundColor: "#F1F1F1",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Pressable onPress={() => setShowPicker(!showPicker)}>
        <Text style={{ color: "blue" }}>Set Rest Time:</Text>
      </Pressable>
      {showPicker && (
        <>
          <View style={styles.inputsView}>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={minutes}
              onChangeText={(text) => handleNumberInput(text)}
            />
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={seconds}
              onChangeText={(text) => handleSecondsInput(text)}
            />
          </View>
          <Button title="Apply" onPress={handleApply} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputsView: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
});

import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { TimerPicker } from "react-native-timer-picker";

export const RestTimePicker = () => {
  const [time, setTime] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View
      style={{
        backgroundColor: "#F1F1F1",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Pressable onPress={() => setShowPicker(!showPicker)}>
        <Text style={{ color: "blue" }}>
          Set Rest Time: {time?.toLocaleString()}
        </Text>
      </Pressable>
      {showPicker && (
        <TimerPicker
          hideHours
          minuteLabel="min"
          padWithNItems={3}
          secondLabel="sec"
          styles={{
            theme: "light",
            pickerLabelGap: 8,
            pickerItem: {
              fontSize: 14,
            },
            pickerLabel: {
              fontSize: 14,
            },
            pickerContainer: {
              paddingHorizontal: 25,
            },
          }}
        />
      )}
    </View>
  );
};

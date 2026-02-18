import { ThemedText } from "@/components/themed-text";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  type ColorValue,
  type GestureResponderEvent,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

export type CustomButtonProps = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  backgroundColor?: ColorValue;
  textColor?: ColorValue;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function CustomButton({
  title,
  onPress,
  backgroundColor = "#007AFF",
  textColor = "#FFFFFF",
  disabled = false,
  style,
  textStyle,
}: CustomButtonProps) {
  const pressedOpacity = Platform.OS === "ios" ? 0.5 : 0.85;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          opacity: disabled ? 0.5 : pressed ? pressedOpacity : 1,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <ThemedText style={[styles.title, { color: textColor }, textStyle]}>
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: Platform.OS === "ios" ? 17 : 16,
    fontWeight: Platform.OS === "ios" ? "500" : "600",
    letterSpacing: Platform.OS === "ios" ? -0.41 : 0,
    textAlign: "center",
  },
});

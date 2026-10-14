import { useThemeColor } from "@/hooks/use-theme-color";
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
import { ThemedText } from "./ThemedText";

export type CustomButtonProps = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: "filled" | "plain";
  backgroundColor?: ColorValue;
  textColor?: ColorValue;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function CustomButton({
  title,
  onPress,
  variant = "filled",
  backgroundColor,
  textColor,
  disabled = false,
  style,
  textStyle,
}: CustomButtonProps) {
  const tintColor = useThemeColor({}, "tint");
  const mutedText = useThemeColor({}, "mutedText");
  // Android shows a ripple instead of dimming on press.
  const pressedOpacity = Platform.OS === "ios" ? 0.5 : 1;
  const isPlain = variant === "plain";

  // Plain buttons turn grey when disabled; filled buttons fade instead.
  const resolvedBackground =
    backgroundColor ?? (isPlain ? "transparent" : tintColor);
  const resolvedTextColor = isPlain
    ? disabled
      ? mutedText
      : (textColor ?? tintColor)
    : (textColor ?? "#FFFFFF");
  const disabledOpacity = isPlain ? 1 : 0.5;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: "rgba(127, 127, 127, 0.2)" }}
      style={({ pressed }) => [
        buttonStyles.button,
        {
          backgroundColor: resolvedBackground,
          opacity: disabled ? disabledOpacity : pressed ? pressedOpacity : 1,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <ThemedText
        style={[buttonStyles.title, { color: resolvedTextColor }, textStyle]}
      >
        {title}
      </ThemedText>
    </Pressable>
  );
}

export const buttonStyles = StyleSheet.create({
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

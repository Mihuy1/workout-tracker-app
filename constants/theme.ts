/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";
const primaryColor = "#0a7ea4";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    surface: "#fff",
    surfaceMuted: "#F2F2F7",
    border: "#D1D1D6",
    mutedText: "#687076",
    placeholder: "#8E8E93",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    primary: primaryColor,
    onPrimary: "#FFFFFF",
    inputBackground: "#F2F2F7",
    overlay: "rgba(0, 0, 0, 0.4)",
    success: "#34C759",
    successMuted: "#DDF6E4",
    danger: "#FF3B30",
    dangerText: "#D70015",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    surface: "#1c1c1e",
    surfaceMuted: "#2c2c2e",
    border: "#3a3a3c",
    mutedText: "#9BA1A6",
    placeholder: "#8E8E93",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    primary: primaryColor,
    onPrimary: "#FFFFFF",
    inputBackground: "#2c2c2e",
    overlay: "rgba(0, 0, 0, 0.6)",
    success: "#30D158",
    successMuted: "#1C3B2A",
    danger: "#FF453A",
    dangerText: "#FF6961",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

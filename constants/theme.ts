/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

export const APPEARANCE_OPTIONS = ["System", "Light", "Dark"] as const;

export type AppearanceType = (typeof APPEARANCE_OPTIONS)[number];

export const COLOR_SCHEMES: Record<
  AppearanceType,
  "light" | "dark" | "unspecified"
> = {
  System: "unspecified",
  Light: "light",
  Dark: "dark",
};

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

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
    iconColor: "black",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    barColor: "#007AFF",

    completedBackground: "#E7F6EC",
    completedBorder: "#B7DFC4",
    success: "#257A48",

    restTimeBackground: "#FFFFFF",
    restTimeBorder: "#D1D5DB",
    progressTrack: "#E5E7EB",
    progressFill: "#3B8D62",

    noButtonBackground: "#d80000",
    noButtonText: "#fff",
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
    iconColor: "white",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    barColor: "#0A84FF",

    completedBackground: "#193B2A",
    completedBorder: "#2F6748",
    success: "#68D391",

    restTimeBackground: "#24282F",
    restTimeBorder: "#3D434D",
    progressTrack: "#3A4049",
    progressFill: "#58BE83",

    noButtonBackground: "#d80000",
    noButtonText: "#fff",
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

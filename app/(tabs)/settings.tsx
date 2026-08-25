import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ui/ThemedText";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useState } from "react";
import {
  Appearance,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

const APPEARANCE_OPTIONS = ["System", "Light", "Dark"] as const;

type AppearanceType = (typeof APPEARANCE_OPTIONS)[number];

const COLOR_SCHEMES: Record<AppearanceType, "light" | "dark" | "unspecified"> =
  {
    System: "unspecified",
    Light: "light",
    Dark: "dark",
  };

export default function TabThreeScreen() {
  const [appearance, setAppearance] = useState<AppearanceType>("System");
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  const colorScheme = useColorScheme();
  const background = useThemeColor({}, "background");
  const surface = useThemeColor({}, "surface");
  const border = useThemeColor({}, "border");
  const iconColor = useThemeColor({}, "icon");
  const selectedBackground = useThemeColor({}, "surfaceMuted");

  return (
    <ScrollView style={[styles.container, { backgroundColor: background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor:
              colorScheme === "dark" ? "#353636" : "#D0D0D0",
          },
        ]}
      >
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      </View>
      <View style={styles.content}>
        <ThemedText>Settings Screen</ThemedText>
        <View style={styles.appearanceRow}>
          <View style={styles.appearanceLabel}>
            <IconSymbol name="moon.fill" color={"#353636"} />
            <ThemedText>Appearance</ThemedText>
          </View>

          <View style={styles.dropdown}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: appearanceOpen }}
              onPress={() => setAppearanceOpen((open) => !open)}
              style={[styles.dropdownTrigger, { borderColor: border }]}
            >
              <ThemedText>{appearance}</ThemedText>
              <IconSymbol
                name="chevron.right"
                size={18}
                color={iconColor}
                style={{
                  transform: [{ rotate: appearanceOpen ? "90deg" : "0deg" }],
                }}
              />
            </Pressable>
            {appearanceOpen && (
              <View
                style={[
                  styles.dropdownMenu,
                  {
                    backgroundColor: surface,
                    borderColor: border,
                  },
                ]}
              >
                {APPEARANCE_OPTIONS.map((option) => {
                  const selected = option === appearance;

                  return (
                    <Pressable
                      key={option}
                      onPress={() => {
                        setAppearance(option);
                        setAppearanceOpen(false);
                        Appearance.setColorScheme(COLOR_SCHEMES[option]);
                      }}
                      style={({ pressed }) => [
                        styles.dropdownOption,
                        selected && {
                          backgroundColor: selectedBackground,
                        },
                        pressed &&
                          !selected && {
                            backgroundColor: selectedBackground,
                            opacity: 0.7,
                          },
                      ]}
                    >
                      <ThemedText>{option}</ThemedText>

                      {selected && (
                        <IconSymbol
                          name="checkmark"
                          size={18}
                          color={iconColor}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 250,
    overflow: "hidden",
  },
  content: {
    padding: 32,
    gap: 16,
  },
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  appearanceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    zIndex: 10,
  },
  appearanceLabel: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dropdown: {
    position: "relative",
    width: 140,
  },
  dropdownTrigger: {
    minHeight: 42,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownMenu: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    zIndex: 20,
    elevation: 4,
  },
  dropdownOption: {
    minHeight: 42,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

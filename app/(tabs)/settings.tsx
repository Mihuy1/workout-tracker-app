import CustomDropdown from "@/components/CustomDropdown";
import { ThemedText } from "@/components/ui/ThemedText";
import { APPEARANCE_OPTIONS } from "@/constants/theme";
import { useThemeProvider } from "@/contexts/themeContext";
import { useWeightUnit } from "@/contexts/weightUnitContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { WEIGHT_UNIT_OPTIONS } from "@/utils/weightUnits";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type OpenDropdown = "appearance" | "weightUnit" | null;

export default function TabThreeScreen() {
  const { appearance, setTheme } = useThemeProvider();
  const { weightUnit, setWeightUnit } = useWeightUnit();

  const background = useThemeColor({}, "background");

  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.safeArea, { backgroundColor: background }]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        onTouchStart={() => setOpenDropdown(null)}
      >
        <ThemedText type="subtitle">Settings Screen</ThemedText>

        <View style={styles.dropdowns}>
          <View style={styles.dropdown}>
            <ThemedText>Appearance</ThemedText>
            <CustomDropdown
              value={appearance}
              options={APPEARANCE_OPTIONS.map((value) => ({
                value,
                label: value,
              }))}
              open={openDropdown === "appearance"}
              onOpenChange={(open) =>
                setOpenDropdown(open ? "appearance" : null)
              }
              onSelect={setTheme}
            />
          </View>
          <View style={styles.dropdown}>
            <ThemedText>Weight Unit</ThemedText>
            <CustomDropdown
              value={weightUnit}
              options={WEIGHT_UNIT_OPTIONS}
              open={openDropdown === "weightUnit"}
              onSelect={setWeightUnit}
              onOpenChange={(open) =>
                setOpenDropdown(open ? "weightUnit" : null)
              }
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
  dropdowns: {
    flexDirection: "column",
    width: "100%",
    gap: 16,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  dropdownLabel: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
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
  separator: {
    height: StyleSheet.hairlineWidth,
  },
});

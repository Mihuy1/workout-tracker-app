import CustomDropdown from "@/components/CustomDropdown";
import { RestTimePicker } from "@/components/timer/RestTimePicker";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ThemedText } from "@/components/ui/ThemedText";
import { APPEARANCE_OPTIONS } from "@/constants/theme";
import { useDefaultRestTime } from "@/contexts/restTimePreferenceContext";
import { useThemeProvider } from "@/contexts/themeContext";
import { useWeightUnit } from "@/contexts/weightUnitContext";
import { WEIGHT_UNIT_OPTIONS } from "@/utils/weightUnits";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

type OpenDropdown = "appearance" | "weightUnit" | "defaultRestTime" | null;

export default function TabThreeScreen() {
  const { appearance, setTheme } = useThemeProvider();
  const { weightUnit, setWeightUnit } = useWeightUnit();
  const { defaultRestTime, setDefaultRestTime } = useDefaultRestTime();

  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);

  return (
    <ScreenContainer>
      <ThemedText type="title">Settings</ThemedText>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        onTouchStart={() => setOpenDropdown(null)}
      >
        <View style={styles.dropdowns}>
          <View style={styles.dropdown}>
            <ThemedText type="defaultSemiBold">Appearance</ThemedText>
            <CustomDropdown
              value={appearance}
              options={APPEARANCE_OPTIONS.map((value) => ({
                value,
                label: value,
              }))}
              open={openDropdown === "appearance"}
              style="menu"
              onOpenChange={(open) =>
                setOpenDropdown(open ? "appearance" : null)
              }
              onSelect={setTheme}
              variant="chip"
            />
          </View>
          <View style={styles.dropdown}>
            <ThemedText type="defaultSemiBold">Weight Unit</ThemedText>
            <CustomDropdown
              value={weightUnit}
              options={WEIGHT_UNIT_OPTIONS}
              open={openDropdown === "weightUnit"}
              onSelect={setWeightUnit}
              style="menu"
              onOpenChange={(open) =>
                setOpenDropdown(open ? "weightUnit" : null)
              }
              variant="chip"
            />
          </View>
          <View style={styles.dropdown}>
            <ThemedText type="defaultSemiBold">Default Rest Timer</ThemedText>
            <RestTimePicker
              restTime={defaultRestTime}
              setRestTime={setDefaultRestTime}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
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
  separator: {
    height: StyleSheet.hairlineWidth,
  },
});

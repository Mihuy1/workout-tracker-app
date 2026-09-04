import CustomDropdown from "@/components/CustomDropdown";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ui/ThemedText";
import { APPEARANCE_OPTIONS } from "@/constants/theme";
import { useThemeProvider } from "@/contexts/themeContext";
import { useWeightUnit } from "@/contexts/weightUnitContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { WEIGHT_UNIT_OPTIONS } from "@/utils/weightUnits";
import { ScrollView, StyleSheet, View } from "react-native";

export default function TabThreeScreen() {
  const { appearance, setTheme } = useThemeProvider();
  const { weightUnit, setWeightUnit } = useWeightUnit();
  const colorScheme = useColorScheme();

  const background = useThemeColor({}, "background");

  return (
    <ScrollView style={[styles.container, { backgroundColor: background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colorScheme === "dark" ? "#353636" : "#D0D0D0",
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

        <View style={styles.dropdowns}>
          <View style={styles.dropdown}>
            <ThemedText>Appearance</ThemedText>
            <CustomDropdown
              value={appearance}
              options={APPEARANCE_OPTIONS.map((value) => ({
                value,
                label: value,
              }))}
              onSelect={setTheme}
            />
          </View>
          <View style={styles.dropdown}>
            <ThemedText>Weight Unit</ThemedText>
            <CustomDropdown
              value={weightUnit}
              options={WEIGHT_UNIT_OPTIONS}
              onSelect={setWeightUnit}
            />
          </View>
        </View>

        {/* <View style={styles.dropdownRow}>
          <View style={styles.dropdownLabel}>
            <ThemedText>Appearance</ThemedText>
          </View>
          <CustomDropDown
            value={appearance}
            options={APPEARANCE_OPTIONS.map((value) => ({
              value,
              label: value,
            }))}
            onSelect={setTheme}
          />
        </View>
        <View style={styles.dropdownRow}>
          <View style={styles.dropdownLabel}>
            <ThemedText>Weight Unit</ThemedText>
          </View>

          <CustomDropDown
            value={weightUnit}
            options={WEIGHT_UNIT_OPTIONS}
            onSelect={setWeightUnit}
          />
        </View> */}
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

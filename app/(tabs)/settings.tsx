import CustomDropDown from "@/components/dropdown";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ui/ThemedText";
import { APPEARANCE_OPTIONS } from "@/constants/theme";
import { useThemeProvider } from "@/contexts/themeContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ScrollView, StyleSheet, View } from "react-native";

export default function TabThreeScreen() {
  const { appearance, setTheme } = useThemeProvider();

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
        <View style={styles.appearanceRow}>
          <View style={styles.appearanceLabel}>
            <IconSymbol name="moon.fill" color={"#353636"} />
            <ThemedText>Appearance</ThemedText>
          </View>

          <View style={styles.dropdown}>
            <CustomDropDown
              value={appearance}
              options={APPEARANCE_OPTIONS}
              onSelect={setTheme}
            />
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

import { useThemeColor } from "@/hooks/use-theme-color";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { IconSymbol } from "./ui/IconSymbol";
import { ThemedText } from "./ui/ThemedText";

interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

interface CustomDropDownProps<T extends string> {
  options: readonly DropdownOption<T>[];
  value: T;
  onSelect: (option: T) => void;
}

export default function CustomDropdown<T extends string>({
  options,
  value,
  onSelect,
}: CustomDropDownProps<T>) {
  const border = useThemeColor({}, "border");
  const iconColor = useThemeColor({}, "iconColor");
  const surface = useThemeColor({}, "surface");
  const selectedBackground = useThemeColor({}, "surfaceMuted");

  const [open, setOpen] = useState(false);

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? value;

  return (
    <View style={styles.dropdown}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((open) => !open)}
        style={[styles.dropdownTrigger, { borderColor: border }]}
      >
        <ThemedText>{selectedLabel}</ThemedText>
        <IconSymbol
          name="chevron.right"
          size={18}
          color={iconColor}
          style={{
            transform: [{ rotate: open ? "90deg" : "0deg" }],
          }}
        />
      </Pressable>
      {open && (
        <View
          style={[
            styles.dropdownMenu,
            {
              backgroundColor: surface,
              borderColor: border,
            },
          ]}
        >
          {options.map((option) => {
            const selected = option.value === value;

            return (
              <Pressable
                key={option.value}
                onPress={async () => {
                  //   setTheme(option);
                  await onSelect(option.value);
                  setOpen(false);
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
                <ThemedText>{option.label}</ThemedText>

                {selected && (
                  <IconSymbol name="checkmark" size={18} color={iconColor} />
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
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
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
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

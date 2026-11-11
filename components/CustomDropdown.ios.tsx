import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { CustomDropDownProps } from "@/utils/CustomDropdown.types";
import { Host, Menu, Picker, Text } from "@expo/ui/swift-ui";
import {
  background,
  contentShape,
  foregroundStyle,
  frame,
  labelsHidden,
  padding,
  pickerStyle,
  shapes,
  strokeBorder,
  tag,
  tint,
} from "@expo/ui/swift-ui/modifiers";

export default function CustomDropdown<T extends string | number>({
  options,
  value,
  open,
  onOpenChange,
  onSelect,
  style = "menu",
  width = 140,
  fullWidth = false,
  centerText = false,
  variant,
  anchorLabel,
  anchorColor,
}: CustomDropDownProps<T>) {
  const border = useThemeColor({}, "border");
  const chipBackground = useThemeColor({}, "chipBackground");
  const chipBorder = useThemeColor({}, "chipBorder");
  const tintColor = useThemeColor({}, "tint");

  const colorScheme = useColorScheme();

  const variantModifiers =
    variant === "bordered"
      ? [
          strokeBorder({
            content: border,
            shape: "roundedRectangle",
            cornerRadius: 8,
            style: { lineWidth: 1 },
          }),
        ]
      : variant === "chip"
        ? [
            padding({ horizontal: 2 }),
            background(chipBackground, shapes.capsule()),
            strokeBorder({
              content: chipBorder,
              shape: "capsule",
              style: { lineWidth: 0.5 },
            }),
            tint(tintColor),
          ]
        : [];

  // A custom anchor label can't be shown by a menu-style Picker (it always
  // shows the selected option), so wrap an inline Picker in a Menu instead.
  if (anchorLabel !== undefined) {
    return (
      <Host matchContents colorScheme={colorScheme}>
        <Menu
          label={
            <Text
              modifiers={[
                foregroundStyle(anchorColor ?? tintColor),
                frame({ minWidth: 44, minHeight: 36 }),
                contentShape(shapes.rectangle()),
              ]}
            >
              {anchorLabel}
            </Text>
          }
          modifiers={variantModifiers}
        >
          <Picker
            selection={value}
            onSelectionChange={(selected) => onSelect(selected as T)}
            modifiers={[pickerStyle("inline"), labelsHidden()]}
          >
            {options.map((option) => (
              <Text key={option.value} modifiers={[tag(option.value)]}>
                {option.label}
              </Text>
            ))}
          </Picker>
        </Menu>
      </Host>
    );
  }

  return (
    <Host
      matchContents={fullWidth ? { vertical: true } : true}
      style={fullWidth ? { width: "100%" } : undefined}
      colorScheme={colorScheme}
    >
      <Picker
        selection={value}
        onSelectionChange={(selected) => onSelect(selected as T)}
        modifiers={[
          pickerStyle(style),
          ...(fullWidth ? [frame({ maxWidth: 1000 })] : []),
          ...variantModifiers,
        ]}
      >
        {options.map((option) => (
          <Text key={option.value} modifiers={[tag(option.value)]}>
            {option.label}
          </Text>
        ))}
      </Picker>
    </Host>
  );
}

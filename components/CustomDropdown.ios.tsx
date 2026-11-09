import { useThemeColor } from "@/hooks/use-theme-color";
import { CustomDropDownProps } from "@/utils/CustomDropdown.types";
import { Host, Picker, Text } from "@expo/ui/swift-ui";
import { pickerStyle, strokeBorder, tag } from "@expo/ui/swift-ui/modifiers";

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
}: CustomDropDownProps<T>) {
  const border = useThemeColor({}, "border");

  return (
    <Host matchContents>
      <Picker
        selection={value}
        onSelectionChange={(selected) => onSelect(selected as T)}
        modifiers={[
          pickerStyle(style),
          ...(style === "menu"
            ? [
                strokeBorder({
                  content: border,
                  shape: "roundedRectangle",
                  cornerRadius: 8,
                  style: { lineWidth: 1 },
                }),
              ]
            : []),
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

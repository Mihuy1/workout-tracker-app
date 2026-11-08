import { CustomDropDownProps } from "@/utils/CustomDropdown.types";
import { Host, Picker, Text } from "@expo/ui/swift-ui";
import { pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";

export default function CustomDropdown<T extends string | number>({
  options,
  value,
  open,
  onOpenChange,
  onSelect,
  width = 140,
  fullWidth = false,
  centerText = false,
}: CustomDropDownProps<T>) {
  return (
    <Host matchContents>
      <Picker
        selection={value}
        onSelectionChange={(selected) => onSelect(selected as T)}
        modifiers={[pickerStyle("menu")]}
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

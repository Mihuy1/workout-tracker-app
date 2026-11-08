import { CustomDropDownProps } from "@/utils/CustomDropdown.types";
import {
  Box,
  DropdownMenuGroup,
  DropdownMenuPopup,
  Host,
  Icon,
  SelectableDropdownMenuItem,
  Text,
  TextButton,
} from "@expo/ui/jetpack-compose";

const checkIcon = require("@/assets/icons/check.xml");

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
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? String(value);

  return (
    <Host matchContents>
      <Box>
        <TextButton onClick={() => onOpenChange(true)}>
          <Text>{`${selectedLabel}`}</Text>
        </TextButton>
        <DropdownMenuPopup
          expanded={open}
          onDismissRequest={() => onOpenChange(false)}
        >
          <DropdownMenuGroup>
            {options.map((option) => (
              <SelectableDropdownMenuItem
                key={option.value}
                selected={option.value === value}
                onClick={() => {
                  onOpenChange(false);
                  onSelect(option.value);
                }}
              >
                <SelectableDropdownMenuItem.Text>
                  <Text>{option.label}</Text>
                </SelectableDropdownMenuItem.Text>
                <SelectableDropdownMenuItem.SelectedLeadingIcon>
                  <Icon source={checkIcon} size={20} />
                </SelectableDropdownMenuItem.SelectedLeadingIcon>
              </SelectableDropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuPopup>
      </Box>
    </Host>
  );
}

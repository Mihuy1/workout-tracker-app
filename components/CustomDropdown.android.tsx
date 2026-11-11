import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { CustomDropDownProps } from "@/utils/CustomDropdown.types";
import {
  Box,
  DropdownMenuGroup,
  DropdownMenuPopup,
  Host,
  Icon,
  LazyColumn,
  ListItem,
  ModalBottomSheet,
  ModalBottomSheetRef,
  OutlinedButton,
  RadioButton,
  SelectableDropdownMenuItem,
  Text,
  TextButton,
} from "@expo/ui/jetpack-compose";
import { clickable } from "@expo/ui/jetpack-compose/modifiers";
import { useRef, useState } from "react";

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
  variant,
  style,
  hideAnchor = true,
  anchorLabel,
  anchorColor,
}: CustomDropDownProps<T>) {
  const backgroundColor = useThemeColor({}, "background");
  const colorScheme = useColorScheme();
  const chipBackground = useThemeColor({}, "chipBackground");
  const surface = useThemeColor({}, "surface");
  const surfaceMuted = useThemeColor({}, "surfaceMuted");
  const text = useThemeColor({}, "text");
  const tint = useThemeColor({}, "tint");

  const selectedLabel =
    anchorLabel ??
    options.find((option) => option.value === value)?.label ??
    String(value);

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = (next: boolean) => {
    setInternalOpen(next);
    onOpenChange?.(next);
  };

  const sheetRef = useRef<ModalBottomSheetRef>(null);

  const selectFromSheet = async (next: T) => {
    onSelect(next);
    await sheetRef.current?.hide();
    setOpen(false);
  };

  const renderAnchor = () => {
    if (variant === "chip")
      return (
        <TextButton
          colors={{ containerColor: chipBackground, contentColor: tint }}
          onClick={() => setOpen(true)}
        >
          <Text color={anchorColor ?? tint}>{selectedLabel}</Text>
        </TextButton>
      );
    if (variant === "bordered")
      return (
        <OutlinedButton onClick={() => setOpen(true)}>
          <Text color={anchorColor}>{`${selectedLabel}`}</Text>
        </OutlinedButton>
      );
    return (
      <TextButton onClick={() => setOpen(true)}>
        <Text color={anchorColor ?? text}>{`${selectedLabel}`}</Text>
      </TextButton>
    );
  };

  if (style === "wheel") {
    return (
      <Host matchContents colorScheme={colorScheme}>
        <Box>
          {!hideAnchor && renderAnchor()}
          {isOpen && (
            <ModalBottomSheet
              ref={sheetRef}
              onDismissRequest={() => setOpen(false)}
              containerColor={backgroundColor}
              showDragHandle
            >
              <LazyColumn>
                {options.map((option) => (
                  <SheetOption
                    key={option.value}
                    label={option.label}
                    selected={option.value === value}
                    onPress={() => selectFromSheet(option.value)}
                    backgroundColor={backgroundColor}
                    textColor={text}
                    tint={tint}
                  />
                ))}
              </LazyColumn>
            </ModalBottomSheet>
          )}
        </Box>
      </Host>
    );
  }

  return (
    <Host matchContents colorScheme={colorScheme}>
      <Box>
        {hideAnchor ? renderAnchor() : []}
        <DropdownMenuPopup
          expanded={isOpen}
          onDismissRequest={() => setOpen(false)}
        >
          <DropdownMenuGroup containerColor={surface} tonalElevation={0}>
            {options.map((option) => (
              <SelectableDropdownMenuItem
                key={option.value}
                selected={option.value === value}
                onClick={() => {
                  setOpen(false);
                  onSelect(option.value);
                }}
                colors={{
                  textColor: text,
                  containerColor: surface,
                  selectedTextColor: tint,
                  selectedContainerColor: surfaceMuted,
                  selectedLeadingIconColor: tint,
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

interface SheetOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  backgroundColor: string;
  textColor: string;
  tint: string;
}

function SheetOption({
  label,
  selected,
  onPress,
  backgroundColor,
  textColor,
  tint,
}: SheetOptionProps) {
  return (
    <ListItem
      colors={{ containerColor: backgroundColor }}
      modifiers={[clickable(onPress)]}
    >
      <ListItem.HeadlineContent>
        <Text color={selected ? tint : textColor}>{label}</Text>
      </ListItem.HeadlineContent>
      <ListItem.TrailingContent>
        <RadioButton
          selected={selected}
          onClick={onPress}
          colors={{ selectedColor: tint }}
        />
      </ListItem.TrailingContent>
    </ListItem>
  );
}

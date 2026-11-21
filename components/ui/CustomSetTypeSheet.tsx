import { useThemeColor } from "@/hooks/use-theme-color";
import { BottomSheet, Column, ListItem, Row, Spacer, Text } from "@expo/ui";

interface CustomSetTypeSheetOption<T extends string | number> {
  value: T;
  label: string;
  labelType: string;
  color?: string;
}

interface CustomSetTypeSheetProps<T extends string | number> {
  open: boolean;
  options: readonly CustomSetTypeSheetOption<T>[];
  onSelect: (option: T) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export default function CustomSetTypeSheet<T extends string | number>({
  open,
  options,
  onSelect,
  onOpenChange,
}: CustomSetTypeSheetProps<T>) {
  const textColor = useThemeColor({}, "text");

  return (
    <BottomSheet
      isPresented={open}
      onDismiss={() => onOpenChange(false)}
      showDragIndicator={false}
    >
      <Column spacing={24}>
        <Row>
          <Spacer flexible />
          <Text
            textStyle={{
              color: textColor,
              fontSize: 20,
              fontWeight: "800",
              textAlign: "center",
            }}
          >
            Set Type
          </Text>
          <Spacer flexible />
        </Row>
        {options.map((option) => (
          <ListItem
            key={String(option.value)}
            onPress={() => {
              onSelect(option.value);
              onOpenChange(false);
            }}
          >
            <Row spacing={24} alignment="center">
              {option.labelType && (
                <Text style={{ width: 24 }} textStyle={{ color: option.color }}>
                  {option.labelType}
                </Text>
              )}
              <Text textStyle={{ color: textColor }}>{option.label}</Text>
            </Row>
          </ListItem>
        ))}
      </Column>
    </BottomSheet>
  );
}

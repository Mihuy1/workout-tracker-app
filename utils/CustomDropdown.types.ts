export interface DropdownOption<T extends string | number> {
  value: T;
  label: string;
}

export interface CustomDropDownProps<T extends string | number> {
  options: readonly DropdownOption<T>[];
  value: T;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (option: T) => void | Promise<void>;
  width?: number;
  fullWidth?: boolean;
  centerText?: boolean;
}

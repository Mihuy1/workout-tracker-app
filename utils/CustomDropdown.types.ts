export interface DropdownOption<T extends string | number> {
  value: T;
  label: string;
}

export interface CustomDropDownProps<T extends string | number> {
  options: readonly DropdownOption<T>[];
  value: T;
  /** Shown on the trigger instead of the selected option's label. */
  anchorLabel?: string;
  /** Text color of the trigger. */
  anchorColor?: string;
  open?: boolean;
  hideAnchor?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect: (option: T) => void | Promise<void>;
  style?: "menu" | "wheel";
  width?: number;
  fullWidth?: boolean;
  centerText?: boolean;
  variant?: "bordered" | "chip" | "borderless";
}

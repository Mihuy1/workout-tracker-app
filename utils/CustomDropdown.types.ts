export interface DropdownOption<T extends string | number> {
  value: T;
  label: string;
  /**
   * Optional option label color.
   *
   * Supported on Android and web. Native iOS menus ignore menu item text
   * colors, so this has no effect there.
   */
  color?: string;
}

export interface CustomDropDownProps<T extends string | number> {
  options: readonly DropdownOption<T>[];
  value: T;
  anchorLabel?: string;
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

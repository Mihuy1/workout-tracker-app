import { CustomDropDownProps } from "@/utils/CustomDropdown.types";
import { ReactElement } from "react";

export default function CustomDropdown<T extends string | number>(
  props: CustomDropDownProps<T>,
): ReactElement;

import { getSetColor, getSetLabel } from "@/types/setTypes";
import { SetType } from "@/types/workout";
import { ThemedText, ThemedTextProps } from "./ThemedText";

type SetTypeLabelProps = Omit<
  ThemedTextProps,
  "children" | "lightColor" | "darkColor"
> & {
  setType: SetType;
  setNumber: number;
};

export default function SetTypeLabel({
  setType,
  setNumber,
  ...rest
}: SetTypeLabelProps) {
  const color = getSetColor(setType);
  return (
    <ThemedText lightColor={color} darkColor={color} {...rest}>
      {getSetLabel(setType, setNumber)}
    </ThemedText>
  );
}

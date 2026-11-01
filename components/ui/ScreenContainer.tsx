import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet } from "react-native";
import {
  SafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";

type ScreenContainerProps = SafeAreaViewProps & {
  padded?: boolean;
};

export function ScreenContainer({
  style,
  edges = ["top", "left", "right"],
  padded = true,
  ...props
}: ScreenContainerProps) {
  const backgroundColor = useThemeColor({}, "background");

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.container,
        { backgroundColor },
        padded && styles.padded,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 10,
  },
});

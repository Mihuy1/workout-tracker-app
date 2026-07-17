import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet } from "react-native";

export default function TabThreeScreen() {
  const iconColor = useThemeColor({}, "icon");

  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        light: Colors.light.surfaceMuted,
        dark: Colors.dark.surfaceMuted,
      }}
      headerImage={
        <IconSymbol
          size={310}
          color={iconColor}
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedText>Settings Screen</ThemedText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});

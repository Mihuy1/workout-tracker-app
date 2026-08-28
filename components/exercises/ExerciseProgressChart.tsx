import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { ThemedText } from "../ui/ThemedText";

type ExerciseProgressProps = {
  heaviestWeight: {
    value: number;
    label: string;
    dataPointText: string;
  }[];

  oneRepMax: {
    value: number;
    label: string;
    dataPointText: string;
  }[];
};

export function ExerciseProgressChart({
  heaviestWeight,
  oneRepMax,
}: ExerciseProgressProps) {
  const primaryColor = useThemeColor({}, "barColor");
  const textColor = useThemeColor({}, "mutedText");
  const borderColor = useThemeColor({}, "border");
  const surfaceColor = useThemeColor({}, "surface");

  if (heaviestWeight.length === 0) {
    return <ThemedText>No exercise history yet.</ThemedText>;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: surfaceColor,
          borderColor,
        },
      ]}
    >
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendColor, { backgroundColor: primaryColor }]}
          />
          <ThemedText>Heaviest weight</ThemedText>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#f59e0b" }]} />
          <ThemedText>Estimated 1RM</ThemedText>
        </View>
      </View>

      <LineChart
        data={heaviestWeight}
        data2={oneRepMax}
        height={220}
        color1={primaryColor}
        color2="#f59e0b"
        dataPointsColor1={primaryColor}
        dataPointsColor2="#f59e0b"
        thickness1={3}
        thickness2={3}
        spacing={60}
        initialSpacing={20}
        endSpacing={20}
        yAxisLabelSuffix=" kg"
        yAxisTextStyle={{ color: textColor }}
        xAxisLabelTextStyle={{ color: textColor }}
        rulesColor={borderColor}
        xAxisColor={borderColor}
        yAxisColor={borderColor}
        focusEnabled
        showDataPointOnFocus
        showTextOnFocus
        showVerticalLines
        verticalLinesColor={borderColor}
        isAnimated
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    overflow: "hidden",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

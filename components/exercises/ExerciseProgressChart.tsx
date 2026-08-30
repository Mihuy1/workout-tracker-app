import { useThemeColor } from "@/hooks/use-theme-color";
import { useState } from "react";
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

type ExerciseDataType = "Heaviest Weight" | "One Rep Max";

export function ExerciseProgressChart({
  heaviestWeight,
  oneRepMax,
}: ExerciseProgressProps) {
  const primaryColor = useThemeColor({}, "barColor");
  const textColor = useThemeColor({}, "mutedText");
  const borderColor = useThemeColor({}, "border");
  const surfaceColor = useThemeColor({}, "surface");

  const [dataType, setDataType] = useState<ExerciseDataType>("Heaviest Weight");
  const [containerWidth, setContainerWidth] = useState(0);

  if (heaviestWeight.length === 0) {
    return <ThemedText>No exercise history yet.</ThemedText>;
  }

  const data = dataType === "Heaviest Weight" ? heaviestWeight : oneRepMax;
  const yAxisLabelWidth = 55;
  const chartWidth = Math.max(0, containerWidth - yAxisLabelWidth);

  const initialSpacing = data.length === 1 ? chartWidth / 2 : 25;
  const endSpacing = 25;
  const minSpacing = 50;

  const calculatedSpacing =
    data.length > 1
      ? (chartWidth - initialSpacing - endSpacing) / (data.length - 1)
      : 0;

  const spacing = Math.max(minSpacing, calculatedSpacing);
  const shouldScroll = data.length > 1 && calculatedSpacing < minSpacing;

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
          <ThemedText>{dataType}</ThemedText>
        </View>
      </View>

      <View
        onLayout={(event) => {
          setContainerWidth(event.nativeEvent.layout.width);
        }}
      >
        {containerWidth > 0 && (
          <LineChart
            data={data}
            height={220}
            width={chartWidth}
            rulesLength={chartWidth}
            color={primaryColor}
            dataPointsColor1={primaryColor}
            thickness={3}
            spacing={spacing}
            initialSpacing={initialSpacing}
            endSpacing={endSpacing}
            disableScroll={!shouldScroll}
            scrollToEnd={shouldScroll}
            yAxisLabelSuffix=" kg"
            yAxisLabelWidth={yAxisLabelWidth}
            yAxisTextStyle={{ color: textColor }}
            xAxisLabelTextStyle={{ color: textColor }}
            rulesColor={borderColor}
            xAxisColor={borderColor}
            yAxisColor={borderColor}
            focusEnabled
            dataPointsRadius={4}
            showTextOnFocus
            showVerticalLines
            verticalLinesColor={borderColor}
            isAnimated
          />
        )}
      </View>
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

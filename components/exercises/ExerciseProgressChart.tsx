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

        {/* <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#f59e0b" }]} />
          <ThemedText>Estimated 1RM</ThemedText>
        </View> */}
      </View>

      <View
        onLayout={(event) => {
          setContainerWidth(event.nativeEvent.layout.width);
        }}
      >
        {containerWidth > 0 && (
          <LineChart
            data={dataType === "Heaviest Weight" ? heaviestWeight : oneRepMax}
            height={220}
            width={containerWidth - 55}
            color1={primaryColor}
            dataPointsColor1={primaryColor}
            thickness1={3}
            adjustToWidth
            disableScroll
            initialSpacing={10}
            endSpacing={0}
            yAxisLabelSuffix=" kg"
            yAxisLabelWidth={55}
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

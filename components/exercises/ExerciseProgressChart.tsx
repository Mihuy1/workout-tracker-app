import { useWeightUnit } from "@/contexts/weightUnitContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useState } from "react";
import { Platform, PlatformColor, StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { CustomButton } from "../ui/CustomButton";
import { ThemedText } from "../ui/ThemedText";

type ExerciseProgressProps = {
  exerciseName: string;

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
  exerciseName,
  heaviestWeight,
  oneRepMax,
}: ExerciseProgressProps) {
  const { weightUnit } = useWeightUnit();

  const primaryColor = useThemeColor({}, "barColor");
  const textColor = useThemeColor({}, "mutedText");
  const borderColor = useThemeColor({}, "border");
  const surfaceColor = useThemeColor({}, "surface");
  const buttonBackground = useThemeColor({}, "surfaceMuted");
  const tintColor = useThemeColor({}, "tint");
  const buttonTextColor =
    Platform.OS === "ios" ? PlatformColor("systemBlue") : tintColor;

  const [dataType, setDataType] = useState<ExerciseDataType>("Heaviest Weight");
  const [selectedLabel, setSelectedLabel] = useState<string>(
    heaviestWeight[heaviestWeight.length - 1].label,
  );
  const [selectedValue, setSelectedValue] = useState<string>(
    heaviestWeight[heaviestWeight.length - 1].dataPointText,
  );
  const [containerWidth, setContainerWidth] = useState(0);

  if (heaviestWeight.length === 0) {
    return <ThemedText>No exercise history yet.</ThemedText>;
  }

  const data = dataType === "Heaviest Weight" ? heaviestWeight : oneRepMax;

  const yAxisLabelWidth = 45;
  const chartWidth = Math.max(0, containerWidth - yAxisLabelWidth);

  const initialSpacing = data.length === 1 ? chartWidth / 2 : 18;
  const endSpacing = data.length === 1 ? chartWidth / 2 : 25;

  const spacing =
    data.length > 1
      ? Math.max(
          0,
          (chartWidth - initialSpacing - endSpacing) / (data.length - 1),
        )
      : 0;

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
      <View style={styles.infoView}>
        <ThemedText type="subtitle">{exerciseName}</ThemedText>
        <View style={styles.statsView}>
          <ThemedText type="defaultSemiBold">{selectedValue}</ThemedText>
          <ThemedText type="default">{selectedLabel}</ThemedText>
        </View>
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}></View>
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
            dataPointsColor={primaryColor}
            thickness={3}
            spacing={spacing}
            initialSpacing={initialSpacing}
            endSpacing={endSpacing}
            disableScroll
            formatYLabel={(label) => Number(label).toFixed(1)}
            yAxisLabelSuffix={` ${weightUnit}`}
            yAxisLabelWidth={yAxisLabelWidth}
            yAxisTextStyle={{ color: textColor, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: textColor, fontSize: 10 }}
            rulesColor={borderColor}
            xAxisColor={borderColor}
            yAxisColor={borderColor}
            focusEnabled
            dataPointsRadius={4}
            showTextOnFocus
            showVerticalLines
            verticalLinesColor={borderColor}
            isAnimated
            showDataPointLabelOnFocus
            pointerConfig={{}}
            getPointerProps={({ pointerIndex }: { pointerIndex: number }) => {
              const point = data[pointerIndex];

              if (point) {
                setSelectedLabel(point.label);
                setSelectedValue(point.dataPointText);
              }
            }}
          />
        )}
      </View>
      <View style={styles.buttonRow}>
        <CustomButton
          title="Heaviest Weight"
          onPress={() => {
            setDataType("Heaviest Weight");
            setSelectedLabel(heaviestWeight[heaviestWeight.length - 1].label);
            setSelectedValue(
              heaviestWeight[heaviestWeight.length - 1].dataPointText,
            );
          }}
          backgroundColor={
            dataType && dataType === "Heaviest Weight"
              ? primaryColor
              : buttonBackground
          }
          textColor={dataType === "Heaviest Weight" ? "white" : buttonTextColor}
        />
        <CustomButton
          title="One Rep Max"
          onPress={() => {
            setDataType("One Rep Max");
            setSelectedLabel(oneRepMax[oneRepMax.length - 1].label);
            setSelectedValue(oneRepMax[oneRepMax.length - 1].dataPointText);
          }}
          backgroundColor={
            dataType && dataType === "One Rep Max"
              ? primaryColor
              : buttonBackground
          }
          textColor={dataType === "One Rep Max" ? "white" : buttonTextColor}
        />
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
  infoView: { padding: 8 },
  statsView: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    paddingTop: 10,
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
  buttonRow: {
    display: "flex",
    flexDirection: "row",
    columnGap: 20,
    marginLeft: 12,
    marginTop: 12,
  },
});

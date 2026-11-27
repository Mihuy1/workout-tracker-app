import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import Animated, {
  clamp,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { CustomButton } from "../ui/CustomButton";
import { IconSymbol } from "../ui/IconSymbol";
import { ThemedText } from "../ui/ThemedText";

const ROW_HEIGHT = 64;
const ROW_GAP = 10;
const SLOT_HEIGHT = ROW_HEIGHT + ROW_GAP;

type Positions = Record<string, number>;
type Item = { id: string; name: string };

interface DraggableRowProps {
  positions: SharedValue<Positions>;
  item: Item;
  count: number;
  onDrop: (positions: Positions) => void;
}

function moveItem(positions: Positions, from: number, to: number): Positions {
  "worklet";
  const next: Positions = {};

  for (const itemId in positions) {
    const position = positions[itemId];

    if (position === from) next[itemId] = to;
    else if (from < to && position > from && position <= to)
      next[itemId] = position - 1; // Downward
    else if (from > to && position >= to && position < from)
      next[itemId] = position + 1; //Upward
    else next[itemId] = position; // Same
  }

  return next;
}

function DraggableRow({ positions, item, count, onDrop }: DraggableRowProps) {
  const borderColor = useThemeColor({}, "border");
  const surfaceColor = useThemeColor({}, "surface");
  const tintColor = useThemeColor({}, "tint");
  const mutedText = useThemeColor({}, "mutedText");

  const isDragging = useSharedValue(false);
  const currentPositon = useSharedValue(positions.value[item.id] * SLOT_HEIGHT);
  const startPosition = useSharedValue(0);

  useAnimatedReaction(
    () => positions.value[item.id],
    (current, previous) => {
      if (current !== previous && !isDragging.value) {
        currentPositon.value = withSpring(current * SLOT_HEIGHT);
      }
    },
  );

  const pan = usePanGesture({
    activateAfterLongPress: 250,
    onActivate: () => {
      isDragging.set(true);
      startPosition.set(currentPositon.get());
    },
    onUpdate: (event) => {
      currentPositon.set(startPosition.get() + event.translationY);
      const newSlot = clamp(
        Math.round(currentPositon.get() / SLOT_HEIGHT),
        0,
        count - 1,
      );
      const oldSlot = positions.get()[item.id];
      if (newSlot !== oldSlot) {
        positions.set(moveItem(positions.value, oldSlot, newSlot));
      }
    },
    onDeactivate: () => {
      currentPositon.set(withSpring(positions.value[item.id] * SLOT_HEIGHT));
      isDragging.set(false);
      scheduleOnRN(onDrop, positions.value);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    top: currentPositon.value,
    zIndex: isDragging.value ? 10 : 0,
    transform: [{ scale: withSpring(isDragging.value ? 1.03 : 1) }],
    borderColor: isDragging.value ? tintColor : borderColor,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.row, animatedStyle, { backgroundColor: surfaceColor }]}
      >
        <ThemedText
          type="defaultSemiBold"
          numberOfLines={1}
          style={styles.title}
        >
          {item.name}
        </ThemedText>
        <View accessible={true}>
          <IconSymbol name="line.3.horizontal" size={18} color={mutedText} />
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

interface ListProps {
  items: Item[];
  onReorder: (orderedIds: string[]) => void;
}

export default function ReorderExercisesList({ items, onReorder }: ListProps) {
  const backgroundColor = useThemeColor({}, "background");

  const positions = useSharedValue<Record<string, number>>(
    Object.fromEntries(items.map((item, index) => [item.id, index])),
  );

  const handleDrop = (final: Positions) => {
    const orderedIds = [...items]
      .sort((a, b) => final[a.id] - final[b.id])
      .map((item) => item.id);
    onReorder(orderedIds);
  };

  return (
    <Animated.ScrollView
      contentInsetAdjustmentBehavior={"automatic"}
      style={{ flex: 1, backgroundColor: backgroundColor }}
    >
      <View style={{ height: items.length * SLOT_HEIGHT, marginBottom: 10 }}>
        {items.map((item) => (
          <DraggableRow
            key={item.id}
            item={item}
            positions={positions}
            count={items.length}
            onDrop={handleDrop}
          />
        ))}
      </View>
      <CustomButton
        variant="filled"
        title="Confirm"
        onPress={() => router.back()}
        style={{ alignSelf: "center", width: "60%" }}
      />
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    flex: 1,
  },
  row: {
    position: "absolute",
    left: 0,
    right: 0,
    height: ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 14,
  },
});

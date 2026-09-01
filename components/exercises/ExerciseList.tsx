import exercises from "@/data/exercises.json";
import { useWorkoutActions } from "@/contexts/workoutActionsContext";
import { useWorkoutState } from "@/contexts/workoutStateContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Exercise } from "@/types/workout";
import { router } from "expo-router";
import Fuse from "fuse.js";
import { useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { ExercisePickerRow, ExercisePickerRowItem } from "./ExercisePickerRow";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedView } from "@/components/ui/ThemedView";

const FILTERS = ["All", "Strength", "Stretch", "Cardio"] as const;
type ExerciseFilter = (typeof FILTERS)[number];

export function ExerciseList() {
  const [text, onChangeText] = useState("");
  const [activeFilter, setActiveFilter] = useState<ExerciseFilter>("All");
  const [addInFlight, setAddInFlight] = useState(false);
  const addInFlightRef = useRef(false);
  const { exercises: workoutExercises } = useWorkoutState();
  const { addExercise } = useWorkoutActions();
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const surface = useThemeColor({}, "surface");
  const placeholderColor = useThemeColor({}, "placeholder");
  const mutedText = useThemeColor({}, "mutedText");
  const surfaceMuted = useThemeColor({}, "surfaceMuted");
  const accent = useThemeColor({}, "barColor");

  const selectedExercisesNames = useMemo(
    () => new Set(workoutExercises.map((exercise) => exercise.name)),
    [workoutExercises],
  );

  const filtered = useMemo(
    () =>
      exercises.filter(
        (exercise) => !selectedExercisesNames.has(exercise.name),
      ),
    [selectedExercisesNames],
  );

  const fuse = useMemo(
    () =>
      new Fuse(exercises, {
        keys: [
          { name: "name" },
          { name: "primaryMuscles" },
          { name: "secondaryMuscles" },
          { name: "equipment" },
          { name: "mechanic" },
          { name: "category" },
        ],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [],
  );

  const searchResults = useMemo(() => {
    const query = text.trim();

    const matches = query
      ? fuse
          .search(query)
          .map((result) => result.item)
          .filter((exercise) => !selectedExercisesNames.has(exercise.name))
      : filtered;

    if (activeFilter === "All") return matches;
    if (activeFilter === "Stretch")
      return matches.filter(
        (exercise) => exercise.category.toLowerCase() === "stretching",
      );

    return matches.filter(
      (exercise) =>
        exercise.category.toLowerCase() === activeFilter.toLowerCase(),
    );
  }, [text, fuse, filtered, selectedExercisesNames, activeFilter]);

  const onAdd = (item: ExercisePickerRowItem) => {
    if (addInFlightRef.current) return;

    addInFlightRef.current = true;
    setAddInFlight(true);

    const exercise: Exercise = {
      exerciseId: item.id,
      name: item.name,
      mechanic: item.mechanic,
      restTime: 0,
      sets: [
        {
          id: 1,
          complete: false,
          weight: "",
          reps: "",
          achievements: [],
        },
      ],
    };

    addExercise(exercise);
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <View
        style={[styles.searchBar, { backgroundColor: surface, borderColor }]}
      >
        <IconSymbol name="magnifyingglass" size={20} color={mutedText} />
        <TextInput
          value={text}
          onChangeText={onChangeText}
          placeholder="Search exercises"
          placeholderTextColor={placeholderColor}
          autoFocus
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="Search exercises"
          style={[styles.searchInput, { color: textColor }]}
        />
      </View>

      <View style={styles.filters}>
        {FILTERS.map((filter) => {
          const selected = filter === activeFilter;

          return (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.filterChip,
                {
                  backgroundColor: selected ? accent : surfaceMuted,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.filterLabel,
                  { color: selected ? "#FFFFFF" : textColor },
                ]}
              >
                {filter}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <ThemedText style={[styles.resultCount, { color: mutedText }]}>
        {searchResults.length}{" "}
        {searchResults.length === 1 ? "exercise" : "exercises"}
      </ThemedText>

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          searchResults.length === 0 && styles.emptyListContent,
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => (
          <ExercisePickerRow
            item={item}
            onAdd={onAdd}
            disabled={addInFlight}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText type="defaultSemiBold">No exercises found</ThemedText>
            <ThemedText style={[styles.emptyCopy, { color: mutedText }]}>
              Try another search or choose a different filter.
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBar: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 16,
    paddingVertical: 0,
  },
  filters: {
    height: 60,
    flexShrink: 0,
    flexDirection: "row",
    gap: 8,
    paddingVertical: 12,
  },
  filterChip: {
    flex: 1,
    minHeight: 36,
    paddingHorizontal: 8,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  filterLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
  },
  resultCount: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
    marginLeft: 2,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  separator: {
    height: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  emptyCopy: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
});

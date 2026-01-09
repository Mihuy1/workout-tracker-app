import exercises from "@/app/datasets/exercises.json";
import { useState } from "react";
import { FlatList, StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "../themed-text";
import Workout from "./workout";

export function WorkoutList() {
  const [text, onChangeText] = useState("");
  return (
    <View style={styles.container}>
      <ThemedText type="title">Exercises</ThemedText>
      <TextInput
        value={text}
        onChangeText={onChangeText}
        placeholder="Search exercises..."
        style={styles.searchInput}
      />
      <FlatList
        data={exercises.filter((item) =>
          item.name.toLowerCase().includes(text.toLowerCase())
        )}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Workout workoutName={item.name} workoutMechanic={item.mechanic} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchInput: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 8,
    marginTop: 8,
  },
});

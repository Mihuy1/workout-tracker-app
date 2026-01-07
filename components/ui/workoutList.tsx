import exercises from "@/app/datasets/exercises.json";
import { useState } from "react";
import { FlatList, StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "../themed-text";

export function WorkoutList() {
  const [text, onChangeText] = useState("");
  return (
    <View style={styles.container}>
      <ThemedText type="title">Exercises</ThemedText>
      <TextInput
        value={text}
        onChangeText={onChangeText}
        placeholder="Search exercises..."
      />
      <FlatList
        data={exercises.filter((item) =>
          item.name.toLowerCase().includes(text.toLowerCase())
        )}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <ThemedText>{item.name}</ThemedText>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

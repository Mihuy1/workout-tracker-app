import { ThemedText } from "@/components/themed-text";
import { NewWorkout } from "@/components/ui/newWorkout";
import { router } from "expo-router";
import { useState } from "react";
import { Button, FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DATA = [
  { id: "1", title: "Routine 1" },
  { id: "2", title: "Routine 2" },
];

export default function HomeScreen() {
  const [showNewWorkout, setShowNewWorkout] = useState(false);
  return (
    <SafeAreaView style={styles.container}>
      {showNewWorkout ? (
        <View style={styles.container}>
          <NewWorkout />
          <Button
            title="Discard Workout"
            color="red"
            onPress={() => setShowNewWorkout(false)}
          />
        </View>
      ) : (
        <View>
          <ThemedText type="title">Home</ThemedText>
          <Button
            title="Start Empty Workout"
            onPress={() => router.push("../new-workout")}
          />
          <ThemedText type="title">Your Routines</ThemedText>
          <FlatList
            data={DATA}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Button title={item.title} onPress={() => {}} />
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  buttonStyle: {
    flex: 1,
    backgroundColor: "#2b97fb",
    padding: 10,
    borderRadius: 5,
  },
});

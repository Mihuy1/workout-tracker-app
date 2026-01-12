import { ThemedText } from "@/components/themed-text";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getSavedPresets } from "../storage/completedExercises";

export default function HomeScreen() {
  const [presets, setPresets] = useState<
    { id: string; title: string; exercises: any[] }[]
  >([]);

  const fetchPresets = async () => {
    const presets = await getSavedPresets();
    console.log("Saved Presets:", presets);

    const presetsArray = Object.entries(presets).map(([name, exercises]) => ({
      id: name,
      title: name,
      exercises: exercises as any[],
    }));

    console.log("Saved preset name:", presetsArray[0]?.title);

    setPresets(presetsArray);
  };

  useEffect(() => {
    fetchPresets();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <ThemedText type="title">Home</ThemedText>
        <Button
          title="Start Empty Workout"
          onPress={() => router.push("../new-workout")}
        />
        <ThemedText type="title">Your Routines</ThemedText>
        <FlatList
          data={presets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Button title={item.title} onPress={() => {}} />
          )}
        />
      </View>
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

import { ThemedText } from "@/components/ui/ThemedText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { Button, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getBestWeightByExerciseName,
  getCompletedExercises,
} from "@/storage/completedExercises";

export default function Statistics() {
  // const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getBestWeightByExerciseName("Dumbell Bicep Curls");

      if (!res) return;

      console.log("res:", res);
    };

    fetchData();
  }, []);

  const checkBestWeight = async () => {
    const res = await getBestWeightByExerciseName("Leg Press");

    console.log("fetched:", res);
  };

  // const saveWeightProgression = async () => {
  //   const res = await saveWeightProgressionByExerciseName(
  //     "Dumbbell Bicep Curls",
  //     "25",
  //   );

  //   console.log("saved:", res);
  // };

  const checkCompletedExercises = async () => {
    const res = await getCompletedExercises();

    console.log("completed exercises:", res);

    console.log("Last completed exercise:", res[res.length - 1].exercises);
  };

  const checkStorage = async () => {
    const allKeys = await AsyncStorage.getAllKeys();
    const allData = await AsyncStorage.multiGet(allKeys);
    console.log(allData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title">Statistics</ThemedText>
      <Button title="Check Best Weight" onPress={checkBestWeight} />
      <Button title="Check Storage" onPress={checkStorage} />
      <Button
        title="Check Completed exercises"
        onPress={checkCompletedExercises}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
});

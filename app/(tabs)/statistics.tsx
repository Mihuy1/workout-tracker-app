import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Button, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getBestWeightByExerciseName,
  saveWeightProgressionByExerciseName,
} from "../storage/completedExercises";

export default function Statistics() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getBestWeightByExerciseName("Dumbell Bicep Curls");

      if (!res) return;

      console.log("res:", res);
    };

    fetchData();
  }, []);

  const checkBestWeight = async () => {
    const res = await getBestWeightByExerciseName("Dumbbell Bicep Curl");

    console.log("fetched:", res);
  };

  const saveWeightProgression = async () => {
    const res = await saveWeightProgressionByExerciseName(
      "Dumbbell Bicep Curls",
      "25",
    );

    console.log("saved:", res);
  };

  const checkStorage = async () => {
    const allKeys = await AsyncStorage.getAllKeys();
    const allData = await AsyncStorage.multiGet(allKeys);
    console.log(allData);
  };

  return (
    <SafeAreaView>
      <Text>Hello</Text>
      <Button title="Check" onPress={checkBestWeight} />
      <Text> {data} kilos</Text>
    </SafeAreaView>
  );
}

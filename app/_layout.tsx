import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { SQLiteProvider } from "expo-sqlite";
import { useState } from "react";
import { RestTimerProvider } from "@/contexts/restTimerContext";
import { WorkoutProvider } from "@/contexts/workoutActionsContext";
import { DATABASE_NAME } from "@/storage/database";
import { migrateDatabase } from "@/storage/migrations";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDatabase}>
          <WorkoutProvider>
            <RestTimerProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="modal"
                  options={{ presentation: "modal", title: "Modal" }}
                />
              </Stack>
              <StatusBar style="auto" />
            </RestTimerProvider>
          </WorkoutProvider>
        </SQLiteProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

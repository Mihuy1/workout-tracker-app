import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import { StatusBar } from "expo-status-bar";

import { RestTimePreferenceProvider } from "@/contexts/restTimePreferenceContext";
import { RestTimerProvider } from "@/contexts/restTimerContext";
import { ThemeContextProvider } from "@/contexts/themeContext";
import { WeightUnitProvider } from "@/contexts/weightUnitContext";
import { WorkoutProvider } from "@/contexts/workoutActionsContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { DATABASE_NAME } from "@/storage/database";
import { migrateDatabase } from "@/storage/migrations";
import { SQLiteProvider } from "expo-sqlite";
import { useState } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [queryClient] = useState(() => new QueryClient());

  return (
    <KeyboardProvider>
      <QueryClientProvider client={queryClient}>
        <WeightUnitProvider>
          <RestTimePreferenceProvider>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <SQLiteProvider
                databaseName={DATABASE_NAME}
                onInit={migrateDatabase}
              >
                <WorkoutProvider>
                  <RestTimerProvider>
                    <ThemeContextProvider>
                      <Stack screenOptions={{ headerTitleAlign: "center" }}>
                        <Stack.Screen
                          name="(tabs)"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="modal"
                          options={{ presentation: "modal", title: "Modal" }}
                        />
                      </Stack>
                      <StatusBar style="auto" />
                    </ThemeContextProvider>
                  </RestTimerProvider>
                </WorkoutProvider>
              </SQLiteProvider>
            </ThemeProvider>
          </RestTimePreferenceProvider>
        </WeightUnitProvider>
      </QueryClientProvider>
    </KeyboardProvider>
  );
}

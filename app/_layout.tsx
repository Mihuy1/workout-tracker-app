import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import { StatusBar } from "expo-status-bar";

import { RestTimerProvider } from "@/contexts/restTimerContext";
import { ThemeContextProvider } from "@/contexts/themeContext";
import { WorkoutProvider } from "@/contexts/workoutActionsContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { DATABASE_NAME } from "@/storage/database";
import { migrateDatabase } from "@/storage/migrations";
import { SQLiteProvider } from "expo-sqlite";
import { useState } from "react";

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
              <ThemeContextProvider>
                <Stack>
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
    </QueryClientProvider>
  );
}

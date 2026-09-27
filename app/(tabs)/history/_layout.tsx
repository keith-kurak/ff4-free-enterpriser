import React from "react";
import { Stack } from "expo-router";

import { useScreenOptions } from "@/hooks/useScreenOptions";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function HistoryLayout() {
  const screenOptions = useScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ headerTitle: "Run History" }} />
      <Stack.Screen name="[runId]" options={{ headerTitle: "Run Details" }} />
    </Stack>
  );
}

import React from "react";
import { Stack } from "expo-router";

import { useScreenOptions } from "@/hooks/useScreenOptions";

export const unstable_settings = {
  anchor: "index",
};

export default function ReferenceLayout() {
  const screenOptions = useScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ headerTitle: "Reference" }} />
      <Stack.Screen
        name="vanilla-story"
        options={{ headerTitle: "Vanilla Story Events" }}
      />
      <Stack.Screen name="shops" options={{ headerTitle: "Shop Locations" }} />
      <Stack.Screen
        name="vanilla-key-items"
        options={{ headerTitle: "Vanilla Key Items" }}
      />
      <Stack.Screen
        name="fe-key-items"
        options={{ headerTitle: "FE Key Items" }}
      />
      <Stack.Screen
        name="fe-key-item-locations"
        options={{ headerTitle: "FE Key Item Locations" }}
      />
    </Stack>
  );
}

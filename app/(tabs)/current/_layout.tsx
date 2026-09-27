import React from "react";
import { Stack } from "expo-router";

import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function CurrentRunLayout() {
  const screenOptions = useScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => <HeaderTitle title="Free Enterpriser" />,
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          presentation: "modal",
          headerTitle: "New Run",
        }}
      />
      <Stack.Screen
        name="complete"
        options={{
          presentation: "modal",
          headerTitle: "Complete Run",
        }}
      />
    </Stack>
  );
}

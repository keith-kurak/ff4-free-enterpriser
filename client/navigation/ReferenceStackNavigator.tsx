import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ReferenceScreen from "@/screens/ReferenceScreen";
import VanillaStoryScreen from "@/screens/VanillaStoryScreen";
import ShopLocationsScreen from "@/screens/ShopLocationsScreen";
import KeyItemLocationsScreen from "@/screens/KeyItemLocationsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type ReferenceStackParamList = {
  Reference: undefined;
  VanillaStory: undefined;
  ShopLocations: undefined;
  KeyItemLocations: undefined;
};

const Stack = createNativeStackNavigator<ReferenceStackParamList>();

export default function ReferenceStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Reference"
        component={ReferenceScreen}
        options={{
          headerTitle: "Reference",
        }}
      />
      <Stack.Screen
        name="VanillaStory"
        component={VanillaStoryScreen}
        options={{
          headerTitle: "Vanilla Story Events",
        }}
      />
      <Stack.Screen
        name="ShopLocations"
        component={ShopLocationsScreen}
        options={{
          headerTitle: "Shop Locations",
        }}
      />
      <Stack.Screen
        name="KeyItemLocations"
        component={KeyItemLocationsScreen}
        options={{
          headerTitle: "Key Item Locations",
        }}
      />
    </Stack.Navigator>
  );
}

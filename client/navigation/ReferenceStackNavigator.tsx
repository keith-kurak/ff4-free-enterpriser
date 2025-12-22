import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ReferenceScreen from "@/screens/ReferenceScreen";
import VanillaStoryScreen from "@/screens/VanillaStoryScreen";
import ShopLocationsScreen from "@/screens/ShopLocationsScreen";
import KeyItemLocationsScreen from "@/screens/KeyItemLocationsScreen";
import FEKeyItemsScreen from "@/screens/FEKeyItemsScreen";
import FEKeyItemLocationsScreen from "@/screens/FEKeyItemLocationsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type ReferenceStackParamList = {
  Reference: undefined;
  VanillaStory: undefined;
  ShopLocations: undefined;
  VanillaKeyItemLocations: undefined;
  FEKeyItems: undefined;
  FEKeyItemLocations: undefined;
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
        name="VanillaKeyItemLocations"
        component={KeyItemLocationsScreen}
        options={{
          headerTitle: "Vanilla Key Items",
        }}
      />
      <Stack.Screen
        name="FEKeyItems"
        component={FEKeyItemsScreen}
        options={{
          headerTitle: "FE Key Items",
        }}
      />
      <Stack.Screen
        name="FEKeyItemLocations"
        component={FEKeyItemLocationsScreen}
        options={{
          headerTitle: "FE Key Item Locations",
        }}
      />
    </Stack.Navigator>
  );
}

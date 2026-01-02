import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CurrentRunScreen from "@/screens/CurrentRunScreen";
import NewRunScreen from "@/screens/NewRunScreen";
import CompleteRunScreen from "@/screens/CompleteRunScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";

export type CurrentRunStackParamList = {
  CurrentRun: undefined;
  NewRun: undefined;
  CompleteRun: undefined;
};

const Stack = createNativeStackNavigator<CurrentRunStackParamList>();

export default function CurrentRunStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="CurrentRun"
        component={CurrentRunScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Free Enterpriser" />,
        }}
      />
      <Stack.Screen
        name="NewRun"
        component={NewRunScreen}
        options={{
          presentation: "modal",
          headerTitle: "New Run",
        }}
      />
      <Stack.Screen
        name="CompleteRun"
        component={CompleteRunScreen}
        options={{
          presentation: "modal",
          headerTitle: "Complete Run",
        }}
      />
    </Stack.Navigator>
  );
}

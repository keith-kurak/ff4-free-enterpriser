import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HistoryScreen from "@/screens/HistoryScreen";
import RunDetailScreen from "@/screens/RunDetailScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type HistoryStackParamList = {
  History: undefined;
  RunDetail: { runId: string };
};

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export default function HistoryStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{
          headerTitle: "Run History",
        }}
      />
      <Stack.Screen
        name="RunDetail"
        component={RunDetailScreen}
        options={{
          headerTitle: "Run Details",
        }}
      />
    </Stack.Navigator>
  );
}

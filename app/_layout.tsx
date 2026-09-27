import React from "react";
import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

function RootStack() {
  const screenOptions = useScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="about" options={{ headerTitle: "About" }} />
      <Stack.Screen
        name="privacy"
        options={{ headerTitle: "Privacy Policy" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.root}>
            <KeyboardProvider>
              <RootStack />
              <StatusBar style="auto" />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

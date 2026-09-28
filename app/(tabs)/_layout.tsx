import React from "react";
import { Tabs } from "expo-router/js-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";

import { useTheme } from "@/hooks/useTheme";

export const unstable_settings = {
  anchor: "current",
};

export default function TabLayout() {
  const { theme, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="current"
        options={{
          title: "Current Run",
          tabBarIcon: ({ color, size }) => (
            <Feather name="play-circle" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <Feather name="clock" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="reference"
        options={{
          title: "Reference",
          tabBarIcon: ({ color, size }) => (
            <Feather name="book-open" size={size} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}

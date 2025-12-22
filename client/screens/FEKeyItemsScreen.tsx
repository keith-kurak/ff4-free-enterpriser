import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { FEKeyItem } from "@/types";
import { getFEKeyItems } from "@/lib/data";

export default function FEKeyItemsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const keyItems = getFEKeyItems();

  const renderItem = ({ item }: { item: FEKeyItem }) => (
    <View style={[styles.item, { borderBottomColor: theme.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.primary + "1A" }]}>
        <Feather name="key" size={16} color={theme.primary} />
      </View>
      <View style={styles.itemContent}>
        <ThemedText type="body" style={styles.itemName}>
          {item.name}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {item.used_for}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <FlatList
      style={[styles.list, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
      scrollIndicatorInsets={{ bottom: tabBarHeight }}
      data={keyItems}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  itemName: {
    fontWeight: "600",
  },
});

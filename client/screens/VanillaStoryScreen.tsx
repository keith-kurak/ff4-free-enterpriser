import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { VanillaStoryEvent } from "@/types";
import { getVanillaStory } from "@/lib/data";

const getEventIcon = (type: string) => {
  switch (type) {
    case "boss_battle":
      return "shield";
    case "character_joins":
      return "user-plus";
    case "character_leaves":
      return "user-minus";
    default:
      return "book";
  }
};

const getEventColor = (type: string, theme: any) => {
  switch (type) {
    case "boss_battle":
      return theme.danger;
    case "character_joins":
      return theme.success;
    case "character_leaves":
      return theme.warning;
    default:
      return theme.primary;
  }
};

export default function VanillaStoryScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const events = getVanillaStory();

  const renderItem = ({ item }: { item: VanillaStoryEvent }) => {
    const color = getEventColor(item.type, theme);
    const icon = getEventIcon(item.type);

    return (
      <Card elevation={1} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.seqBadge, { backgroundColor: color + "1A" }]}>
            <ThemedText type="small" style={{ color, fontWeight: "600" }}>
              {item.seq}
            </ThemedText>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.titleRow}>
              <Feather name={icon as any} size={16} color={color} />
              <ThemedText type="body" style={styles.title}>
                {item.title}
              </ThemedText>
            </View>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={12} color={theme.textSecondary} />
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {item.details.location}
              </ThemedText>
            </View>
            {item.details.notes ? (
              <ThemedText
                type="small"
                style={[styles.notes, { color: theme.textSecondary }]}
              >
                {item.details.notes}
              </ThemedText>
            ) : null}
            {item.details.optional ? (
              <View style={[styles.optionalBadge, { backgroundColor: theme.warning + "1A" }]}>
                <ThemedText type="small" style={{ color: theme.warning }}>
                  Optional
                </ThemedText>
              </View>
            ) : null}
          </View>
        </View>
      </Card>
    );
  };

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
      data={events}
      keyExtractor={(item) => item.seq.toString()}
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
    gap: Spacing.md,
  },
  card: {
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  seqBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    fontWeight: "500",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  notes: {
    marginTop: Spacing.xs,
  },
  optionalBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
});

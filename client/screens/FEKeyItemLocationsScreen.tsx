import React from "react";
import { View, SectionList, StyleSheet } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { FEKeyItemLocation } from "@/types";
import { getFEKeyItemLocations } from "@/lib/data";

const getTypeInfo = (type: string) => {
  switch (type) {
    case "main_quest":
      return { icon: "star", label: "Main Quest" };
    case "summon_quest":
      return { icon: "zap", label: "Summon Quest" };
    case "miab_chests":
      return { icon: "box", label: "Monster-in-a-Box" };
    default:
      return { icon: "circle", label: type };
  }
};

export default function FEKeyItemLocationsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const locations = getFEKeyItemLocations();

  const mainQuest = locations.filter((i) => i.type === "main_quest");
  const summonQuest = locations.filter((i) => i.type === "summon_quest");
  const miabChests = locations.filter((i) => i.type === "miab_chests");

  const sections = [
    { title: "Main Quest", data: mainQuest, type: "main_quest" },
    { title: "Summon Quests", data: summonQuest, type: "summon_quest" },
    { title: "Monster-in-a-Box", data: miabChests, type: "miab_chests" },
  ].filter((s) => s.data.length > 0);

  const formatLockName = (lockId: string) => {
    return lockId
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const renderItem = ({ item }: { item: FEKeyItemLocation }) => (
    <View style={[styles.item, { borderBottomColor: theme.border }]}>
      <View style={styles.itemContent}>
        <ThemedText type="body" style={styles.location}>
          {item.location}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {item.check}
        </ThemedText>
        {item.miab_chest_count ? (
          <View style={[styles.countBadge, { backgroundColor: theme.warning + "1A" }]}>
            <ThemedText type="small" style={{ color: theme.warning }}>
              {item.miab_chest_count} chest{item.miab_chest_count > 1 ? "s" : ""}
            </ThemedText>
          </View>
        ) : null}
        {item.locked_by ? (
          <View style={styles.infoRow}>
            <Feather name="key" size={12} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {formatLockName(item.locked_by)}
            </ThemedText>
          </View>
        ) : null}
        {item.location_lock ? (
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={12} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {formatLockName(item.location_lock)}
            </ThemedText>
          </View>
        ) : null}
        {item.notes ? (
          <View style={[styles.notesContainer, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="small" style={{ color: theme.textSecondary, fontStyle: "italic" }}>
              {item.notes}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </View>
  );

  const renderSectionHeader = ({
    section,
  }: {
    section: { title: string; type: string };
  }) => {
    const { icon } = getTypeInfo(section.type);
    return (
      <View style={[styles.sectionHeader, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name={icon as any} size={14} color={theme.primary} />
        <ThemedText type="body" style={styles.sectionTitle}>
          {section.title}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          ({sections.find((s) => s.title === section.title)?.data.length || 0})
        </ThemedText>
      </View>
    );
  };

  return (
    <SectionList
      style={[styles.list, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
      scrollIndicatorInsets={{ bottom: tabBarHeight }}
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled={false}
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
  sectionTitle: {
    fontWeight: "600",
    flex: 1,
  },
  item: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  itemContent: {
    gap: Spacing.xs,
  },
  location: {
    fontWeight: "500",
  },
  conditionBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  countBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  notesContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
});

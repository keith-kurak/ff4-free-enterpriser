import React from "react";
import { View, SectionList, StyleSheet } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Shop } from "@/types";
import { getShopsByLocation } from "@/lib/data";

const getShopIcon = (type: string) => {
  switch (type) {
    case "weapon":
      return "crosshair";
    case "armor":
      return "shield";
    case "item":
      return "package";
    case "weapon_armor":
      return "layers";
    default:
      return "shopping-bag";
  }
};

export default function ShopLocationsScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const shopsByLocation = getShopsByLocation();
  const locations = Array.from(shopsByLocation.keys()).sort();

  const sections = locations.map((location) => ({
    title: location,
    data: shopsByLocation.get(location) || [],
  }));

  const renderItem = ({ item }: { item: Shop }) => (
    <View style={[styles.item, { borderBottomColor: theme.border }]}>
      <Feather name={getShopIcon(item.type) as any} size={18} color={theme.primary} />
      <View style={styles.itemContent}>
        <ThemedText type="body">{item.name}</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {item.type.replace("_", " & ").charAt(0).toUpperCase() +
            item.type.replace("_", " & ").slice(1)}
        </ThemedText>
      </View>
    </View>
  );

  const renderSectionHeader = ({
    section,
  }: {
    section: { title: string };
  }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.backgroundDefault }]}>
      <Feather name="map-pin" size={14} color={theme.textSecondary} />
      <ThemedText type="body" style={styles.sectionTitle}>
        {section.title}
      </ThemedText>
    </View>
  );

  return (
    <SectionList
      style={[styles.list, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
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
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  itemContent: {
    flex: 1,
    gap: Spacing.xs,
  },
});

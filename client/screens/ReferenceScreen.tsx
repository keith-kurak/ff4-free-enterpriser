import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { Feather } from "@expo/vector-icons";

import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { getVanillaStory, getShops, getKeyItems, getFEKeyItems, getFEKeyItemLocations } from "@/lib/data";


export default function ReferenceScreen() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const storyCount = getVanillaStory().length;
  const shopCount = getShops().length;
  const vanillaKeyItemCount = getKeyItems().length;
  const feKeyItemCount = getFEKeyItems().length;
  const feKeyItemLocationCount = getFEKeyItemLocations().length;

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
    >
      <Card
        elevation={1}
        onPress={() => router.push("/reference/vanilla-story")}
        style={styles.card}
      >
        <Feather name="book-open" size={24} color={theme.primary} />
        <ThemedText type="body" style={styles.cardTitle}>
          Vanilla Story Events
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {storyCount} events
        </ThemedText>
        <Feather
          name="chevron-right"
          size={20}
          color={theme.textSecondary}
          style={styles.chevron}
        />
      </Card>

      <Card
        elevation={1}
        onPress={() => router.push("/reference/shops")}
        style={styles.card}
      >
        <Feather name="shopping-cart" size={24} color={theme.primary} />
        <ThemedText type="body" style={styles.cardTitle}>
          Shop Locations
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {shopCount} shops
        </ThemedText>
        <Feather
          name="chevron-right"
          size={20}
          color={theme.textSecondary}
          style={styles.chevron}
        />
      </Card>

      <Card
        elevation={1}
        onPress={() => router.push("/reference/vanilla-key-items")}
        style={styles.card}
      >
        <Feather name="map-pin" size={24} color={theme.primary} />
        <ThemedText type="body" style={styles.cardTitle}>
          Vanilla Key Items and Locations
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {vanillaKeyItemCount} locations
        </ThemedText>
        <Feather
          name="chevron-right"
          size={20}
          color={theme.textSecondary}
          style={styles.chevron}
        />
      </Card>

      <Card
        elevation={1}
        onPress={() => router.push("/reference/fe-key-items")}
        style={styles.card}
      >
        <Feather name="key" size={24} color={theme.primary} />
        <ThemedText type="body" style={styles.cardTitle}>
          FE Key Items
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {feKeyItemCount} items
        </ThemedText>
        <Feather
          name="chevron-right"
          size={20}
          color={theme.textSecondary}
          style={styles.chevron}
        />
      </Card>

      <Card
        elevation={1}
        onPress={() => router.push("/reference/fe-key-item-locations")}
        style={styles.card}
      >
        <Feather name="star" size={24} color={theme.primary} />
        <ThemedText type="body" style={styles.cardTitle}>
          FE Key Item Locations
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {feKeyItemLocationCount} locations
        </ThemedText>
        <Feather
          name="chevron-right"
          size={20}
          color={theme.textSecondary}
          style={styles.chevron}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  cardTitle: {
    flex: 1,
    fontWeight: "600",
  },
  chevron: {
    marginLeft: "auto",
  },
});

import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { ReferenceStackParamList } from "@/navigation/ReferenceStackNavigator";
import { getVanillaStory, getShops, getKeyItems } from "@/lib/data";

type NavigationProp = NativeStackNavigationProp<ReferenceStackParamList>;

export default function ReferenceScreen() {
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const storyCount = getVanillaStory().length;
  const shopCount = getShops().length;
  const keyItemCount = getKeyItems().length;

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
        onPress={() => navigation.navigate("VanillaStory")}
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
        onPress={() => navigation.navigate("ShopLocations")}
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
        onPress={() => navigation.navigate("KeyItemLocations")}
        style={styles.card}
      >
        <Feather name="star" size={24} color={theme.primary} />
        <ThemedText type="body" style={styles.cardTitle}>
          Key Item Locations
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {keyItemCount} locations
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

import React, { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { CheckboxRow } from "@/components/CheckboxRow";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { CurrentRunStackParamList } from "@/navigation/CurrentRunStackNavigator";
import { ActiveRun, Shop, KeyItem } from "@/types";
import { getActiveRun, saveActiveRun } from "@/lib/storage";
import { getShopsByLocation, getKeyItemsByType, getShops, getKeyItems } from "@/lib/data";

type NavigationProp = NativeStackNavigationProp<CurrentRunStackParamList>;

export default function CurrentRunScreen() {
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [activeRun, setActiveRun] = useState<ActiveRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRun = useCallback(async () => {
    const run = await getActiveRun();
    setActiveRun(run);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRun();
    }, [loadRun])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRun();
    setRefreshing(false);
  }, [loadRun]);

  const handleShopToggle = async (shopId: string, field: 'visited' | 'returnTo') => {
    if (!activeRun) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const updatedVisits = activeRun.shopVisits.map((sv) => {
      if (sv.shopId === shopId) {
        return { ...sv, [field]: !sv[field] };
      }
      return sv;
    });

    const updatedRun = { ...activeRun, shopVisits: updatedVisits };
    setActiveRun(updatedRun);
    await saveActiveRun(updatedRun);
  };

  const handleKeyItemToggle = async (keyItemId: string) => {
    if (!activeRun) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const updatedChecks = activeRun.keyItemChecks.map((kic) => {
      if (kic.keyItemId === keyItemId) {
        return { ...kic, checked: !kic.checked };
      }
      return kic;
    });

    const updatedRun = { ...activeRun, keyItemChecks: updatedChecks };
    setActiveRun(updatedRun);
    await saveActiveRun(updatedRun);
  };

  const handleCompleteRun = () => {
    navigation.navigate("CompleteRun");
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { paddingTop: headerHeight }]}>
        <View style={styles.centerContent}>
          <ThemedText type="body">Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!activeRun) {
    return (
      <ThemedView style={[styles.container, { paddingTop: headerHeight }]}>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.primary + "1A" }]}>
            <Feather name="play-circle" size={48} color={theme.primary} />
          </View>
          <ThemedText type="h4" style={styles.emptyTitle}>
            No Active Run
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.emptyDescription, { color: theme.textSecondary }]}
          >
            Start a new Free Enterprise run to track your progress
          </ThemedText>
          <Button
            onPress={() => navigation.navigate("NewRun")}
            style={styles.startButton}
          >
            Start New Run
          </Button>
        </View>
      </ThemedView>
    );
  }

  const shopsByLocation = getShopsByLocation();
  const allShops = getShops();
  const allKeyItems = getKeyItems();
  const { mainQuest, summonQuest, miabChests } = getKeyItemsByType(activeRun.flags);

  const getShopVisit = (shopId: string) => {
    return activeRun.shopVisits.find((sv) => sv.shopId === shopId);
  };

  const getKeyItemCheck = (keyItemId: string) => {
    return activeRun.keyItemChecks.find((kic) => kic.keyItemId === keyItemId);
  };

  const getShopById = (shopId: string): Shop | undefined => {
    return allShops.find((s) => s.id === shopId);
  };

  const getKeyItemById = (keyItemId: string): KeyItem | undefined => {
    return allKeyItems.find((ki) => ki.id === keyItemId);
  };

  const locations = Array.from(shopsByLocation.keys()).sort();

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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <ThemedText type="h4">{activeRun.name}</ThemedText>
        <Button onPress={handleCompleteRun} style={styles.completeButton}>
          Complete Run
        </Button>
      </View>

      <View style={styles.flagsSummary}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Flags:{" "}
          {[
            activeRun.flags.summonQuestRewards && "Summon",
            activeRun.flags.lunarSubterraneBosses && "Lunar",
            activeRun.flags.monsterInABox && "MIAB",
            activeRun.flags.freeItemToroia && "Toroia",
          ]
            .filter(Boolean)
            .join(", ") || "None"}
        </ThemedText>
      </View>

      <CollapsibleSection title="Shops" defaultExpanded>
        {locations.map((location) => {
          const shops = shopsByLocation.get(location) || [];
          return (
            <View key={location} style={styles.locationGroup}>
              <ThemedText
                type="small"
                style={[styles.locationHeader, { color: theme.textSecondary }]}
              >
                {location}
              </ThemedText>
              {shops.map((shop) => {
                const visit = getShopVisit(shop.id);
                return (
                  <CheckboxRow
                    key={shop.id}
                    label={shop.name}
                    checked={visit?.visited || false}
                    onToggle={() => handleShopToggle(shop.id, "visited")}
                    showReturn
                    returnChecked={visit?.returnTo || false}
                    onReturnToggle={() => handleShopToggle(shop.id, "returnTo")}
                  />
                );
              })}
            </View>
          );
        })}
      </CollapsibleSection>

      <CollapsibleSection title="Key Items" defaultExpanded>
        {mainQuest.length > 0 && (
          <View style={styles.keyItemGroup}>
            <ThemedText
              type="small"
              style={[styles.locationHeader, { color: theme.textSecondary }]}
            >
              Main Quest
            </ThemedText>
            {mainQuest.map((item) => {
              const check = getKeyItemCheck(item.id);
              return (
                <CheckboxRow
                  key={item.id}
                  label={`${item.location}: ${item.check}`}
                  checked={check?.checked || false}
                  onToggle={() => handleKeyItemToggle(item.id)}
                />
              );
            })}
          </View>
        )}

        {summonQuest.length > 0 && (
          <View style={styles.keyItemGroup}>
            <ThemedText
              type="small"
              style={[styles.locationHeader, { color: theme.textSecondary }]}
            >
              Summon Quests
            </ThemedText>
            {summonQuest.map((item) => {
              const check = getKeyItemCheck(item.id);
              return (
                <CheckboxRow
                  key={item.id}
                  label={`${item.location}: ${item.check}`}
                  checked={check?.checked || false}
                  onToggle={() => handleKeyItemToggle(item.id)}
                />
              );
            })}
          </View>
        )}

        {miabChests.length > 0 && (
          <View style={styles.keyItemGroup}>
            <ThemedText
              type="small"
              style={[styles.locationHeader, { color: theme.textSecondary }]}
            >
              Monster-in-a-Box Chests
            </ThemedText>
            {miabChests.map((item) => {
              const check = getKeyItemCheck(item.id);
              return (
                <CheckboxRow
                  key={item.id}
                  label={`${item.location} (${item.miab_chest_count} chests)`}
                  checked={check?.checked || false}
                  onToggle={() => handleKeyItemToggle(item.id)}
                />
              );
            })}
          </View>
        )}
      </CollapsibleSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["3xl"],
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  startButton: {
    paddingHorizontal: Spacing["3xl"],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  completeButton: {
    paddingHorizontal: Spacing.xl,
  },
  flagsSummary: {
    marginTop: -Spacing.sm,
  },
  locationGroup: {
    marginBottom: Spacing.md,
  },
  locationHeader: {
    marginBottom: Spacing.xs,
    fontWeight: "600",
  },
  keyItemGroup: {
    marginBottom: Spacing.md,
  },
});

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
import { ActiveRun, Shop, FEKeyItemLocation } from "@/types";
import { getActiveRun, saveActiveRun, clearActiveRun } from "@/lib/storage";
import { getShopsByLocation, getShops, getFEKeyItemLocationsByLocation, getFEKeyItemLocations } from "@/lib/data";

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

  const handleCancelRun = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await clearActiveRun();
    setActiveRun(null);
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
  const allKeyItemLocations = getFEKeyItemLocations();
  const keyItemLocationsByLocation = getFEKeyItemLocationsByLocation(activeRun.flags);

  const getShopVisit = (shopId: string) => {
    return activeRun.shopVisits.find((sv) => sv.shopId === shopId);
  };

  const getKeyItemCheck = (keyItemId: string) => {
    return activeRun.keyItemChecks.find((kic) => kic.keyItemId === keyItemId);
  };

  const getShopById = (shopId: string): Shop | undefined => {
    return allShops.find((s) => s.id === shopId);
  };

  const getKeyItemLocationById = (keyItemId: string): FEKeyItemLocation | undefined => {
    return allKeyItemLocations.find((ki) => ki.id === keyItemId);
  };

  const shopLocations = Array.from(shopsByLocation.keys());
  const keyItemLocations = Array.from(keyItemLocationsByLocation.keys());

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
        {shopLocations.map((location) => {
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

      <CollapsibleSection title="Key Item Locations" defaultExpanded>
        {keyItemLocations.map((location) => {
          const items = keyItemLocationsByLocation.get(location) || [];
          return (
            <View key={location} style={styles.locationGroup}>
              <ThemedText
                type="small"
                style={[styles.locationHeader, { color: theme.textSecondary }]}
              >
                {location}
              </ThemedText>
              {items.map((item) => {
                const check = getKeyItemCheck(item.id);
                const label = item.miab_chest_count
                  ? `${item.check} (${item.miab_chest_count} chests)`
                  : item.check;
                return (
                  <CheckboxRow
                    key={item.id}
                    label={label}
                    checked={check?.checked || false}
                    onToggle={() => handleKeyItemToggle(item.id)}
                  />
                );
              })}
            </View>
          );
        })}
      </CollapsibleSection>

      <View style={styles.cancelContainer}>
        <Button
          onPress={handleCancelRun}
          variant="outline"
          style={[styles.cancelButton, { borderColor: theme.danger }]}
          textStyle={{ color: theme.danger }}
        >
          Cancel Run
        </Button>
      </View>
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
  cancelContainer: {
    marginTop: Spacing.xl,
    alignItems: "center",
  },
  cancelButton: {
    paddingHorizontal: Spacing["3xl"],
  },
});

import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import {
  FlagStringView,
  RuleSectionsView,
  TrackingSummaryView,
} from "@/components/RunRulesView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { Run } from "@/types";
import { getCurrentRun, clearCurrentRun } from "@/lib/runs";
import { rulesForRun } from "@/lib/fe/rules";

const METHOD_LABELS: Record<Run["inputMethod"], string> = {
  flagset: "From flagset",
  code: "From flag code",
  manual: "Manual flags",
};

export default function CurrentRunScreen() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRun = useCallback(async () => {
    setRun(await getCurrentRun());
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRun();
    }, [loadRun]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRun();
    setRefreshing(false);
  }, [loadRun]);

  const rules = useMemo(() => (run ? rulesForRun(run) : null), [run]);

  const handleCancelRun = () => {
    Alert.alert(
      "Cancel Run",
      "Are you sure you want to cancel this run? It will not be saved to history.",
      [
        { text: "Keep Running", style: "cancel" },
        {
          text: "Cancel Run",
          style: "destructive",
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await clearCurrentRun();
            setRun(null);
          },
        },
      ],
    );
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

  if (!run) {
    return (
      <ThemedView style={[styles.container, { paddingTop: headerHeight }]}>
        <View style={styles.emptyState}>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: theme.primary + "1A" },
            ]}
          >
            <Feather name="play-circle" size={48} color={theme.primary} />
          </View>
          <ThemedText type="h4" style={styles.emptyTitle}>
            No Active Run
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.emptyDescription, { color: theme.textSecondary }]}
          >
            Start a new Free Enterprise run from your flagset to see its rules
          </ThemedText>
          <Button
            onPress={() => router.push("/current/new")}
            style={styles.startButton}
          >
            Start New Run
          </Button>
        </View>
      </ThemedView>
    );
  }

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
        <View style={styles.headerText}>
          <ThemedText type="h4">{run.name}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {METHOD_LABELS[run.inputMethod]} · FE v{run.feVersion}
          </ThemedText>
        </View>
        <Button
          onPress={() => router.push("/current/complete")}
          style={styles.completeButton}
        >
          Complete Run
        </Button>
      </View>

      {rules ? (
        <>
          <TrackingSummaryView groups={rules.tracking} />
          {run.inputMethod !== "manual" ? (
            <View style={styles.section}>
              <ThemedText type="h4">All rules</ThemedText>
              <RuleSectionsView sections={rules.sections} />
            </View>
          ) : null}
        </>
      ) : (
        <ThemedText type="body" style={{ color: theme.danger }}>
          The flags for this run cannot be read.
        </ThemedText>
      )}

      <View style={styles.section}>
        <FlagStringView label="Flags" value={run.flags} />
        {run.flagCode ? (
          <FlagStringView label="Flag code" value={run.flagCode} />
        ) : null}
      </View>

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
    gap: Spacing.md,
  },
  headerText: {
    flex: 1,
    gap: Spacing.xs,
  },
  completeButton: {
    paddingHorizontal: Spacing.xl,
  },
  section: {
    gap: Spacing.sm,
  },
  cancelContainer: {
    marginTop: Spacing.xl,
    alignItems: "center",
  },
  cancelButton: {
    paddingHorizontal: Spacing["3xl"],
  },
});

import React, { useState, useEffect, useMemo } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { FlagStringView, RuleSectionsView, TrackingSummaryView } from "@/components/RunRulesView";
import { CompletedRun, Run } from "@/types";
import { getCompletedRuns, deleteCompletedRun } from "@/lib/storage";
import { getRuns, deleteRun } from "@/lib/runs";
import { rulesForRun } from "@/lib/fe/rules";

function isLegacyRun(run: CompletedRun | Run): run is CompletedRun {
  return !("schemaVersion" in run);
}


export default function RunDetailScreen() {
  const router = useRouter();
  const { runId } = useLocalSearchParams<{ runId: string }>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [run, setRun] = useState<CompletedRun | Run | null>(null);

  useEffect(() => {
    loadRun();
  }, [runId]);

  const loadRun = async () => {
    const found =
      (await getRuns()).find((r) => r.id === runId) ??
      (await getCompletedRuns()).find((r) => r.id === runId);
    setRun(found || null);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Run",
      "Are you sure you want to delete this run? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            if (run && isLegacyRun(run)) await deleteCompletedRun(runId);
            else await deleteRun(runId);
            router.back();
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const rules = useMemo(() => (run && !isLegacyRun(run) ? rulesForRun(run) : null), [run]);

  if (!run) {
    return (
      <ThemedView style={[styles.container, { paddingTop: headerHeight }]}>
        <View style={styles.centerContent}>
          <ThemedText type="body">Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const finalParty = run.finalParty ?? [];

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <ThemedText type="h3">{run.name}</ThemedText>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        {run.completedAt
          ? `Completed ${formatDate(run.completedAt)} at ${formatTime(run.completedAt)}`
          : null}
      </ThemedText>

      <Card elevation={1} style={styles.statsCard}>
        <View style={styles.mainStat}>
          <Feather name="clock" size={24} color={theme.primary} />
          <ThemedText type="h3" style={{ color: theme.primary }}>
            {run.completionTime}
          </ThemedText>
        </View>
      </Card>

      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h4">{run.keyItemsCollected ?? "-"}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Key Items
          </ThemedText>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h4">{run.treasureChests ?? "-"}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Chests
          </ThemedText>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h4">{run.characterCount ?? "-"}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Characters
          </ThemedText>
        </View>
      </View>

      {finalParty.length > 0 ? (
        <View style={styles.section}>
          <ThemedText type="body" style={styles.sectionTitle}>
            Final Party
          </ThemedText>
          <View style={styles.partyRow}>
            {finalParty.map((character) => (
              <View
                key={character}
                style={[styles.partyBadge, { backgroundColor: theme.primary + "1A" }]}
              >
                <ThemedText type="small" style={{ color: theme.primary }}>
                  {character}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {isLegacyRun(run) ? (
        <LegacyRunDetails run={run} />
      ) : (
        <>
          {rules ? (
            <>
              <TrackingSummaryView groups={rules.tracking} />
              {run.inputMethod !== "manual" ? (
                <View style={styles.section}>
                  <ThemedText type="body" style={styles.sectionTitle}>
                    All rules
                  </ThemedText>
                  <RuleSectionsView sections={rules.sections} />
                </View>
              ) : null}
            </>
          ) : null}
          <View style={styles.section}>
            <FlagStringView label="Flags" value={run.flags} />
            {run.flagCode ? <FlagStringView label="Flag code" value={run.flagCode} /> : null}
          </View>
        </>
      )}

      <Button
        onPress={handleDelete}
        style={[styles.deleteButton, { backgroundColor: theme.danger }]}
      >
        Delete Run
      </Button>
    </ScrollView>
  );
}

function LegacyRunDetails({ run }: { run: CompletedRun }) {
  const { theme } = useTheme();
  const shopsVisited = run.shopVisits.filter((sv) => sv.visited).length;
  const keyItemsChecked = run.keyItemChecks.filter((kic) => kic.checked).length;

  return (
    <>
      <View style={styles.section}>
        <ThemedText type="body" style={styles.sectionTitle}>
          Run Flags
        </ThemedText>
        <View style={styles.flagsRow}>
          {run.flags.summonQuestRewards ? (
            <View style={[styles.flagBadge, { backgroundColor: theme.success + "1A" }]}>
              <ThemedText type="small" style={{ color: theme.success }}>
                Summon
              </ThemedText>
            </View>
          ) : null}
          {run.flags.lunarSubterraneBosses ? (
            <View style={[styles.flagBadge, { backgroundColor: theme.success + "1A" }]}>
              <ThemedText type="small" style={{ color: theme.success }}>
                Lunar
              </ThemedText>
            </View>
          ) : null}
          {run.flags.monsterInABox ? (
            <View style={[styles.flagBadge, { backgroundColor: theme.success + "1A" }]}>
              <ThemedText type="small" style={{ color: theme.success }}>
                MIAB
              </ThemedText>
            </View>
          ) : null}
          {run.flags.freeItemToroia ? (
            <View style={[styles.flagBadge, { backgroundColor: theme.success + "1A" }]}>
              <ThemedText type="small" style={{ color: theme.success }}>
                Toroia
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="body" style={styles.sectionTitle}>
          Progress Summary
        </ThemedText>
        <View style={styles.progressList}>
          <View style={styles.progressItem}>
            <ThemedText type="body">Shops Visited</ThemedText>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {shopsVisited}
            </ThemedText>
          </View>
          <View style={[styles.progressItem, { borderBottomWidth: 0 }]}>
            <ThemedText type="body">Key Items Checked</ThemedText>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {keyItemsChecked}
            </ThemedText>
          </View>
        </View>
      </View>
    </>
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
  statsCard: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
  },
  mainStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontWeight: "600",
  },
  partyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  partyBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  flagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  flagBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  progressList: {
    borderRadius: BorderRadius.sm,
  },
  progressItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  deleteButton: {
    marginTop: Spacing.xl,
  },
});

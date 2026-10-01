import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RuleSection, TrackingGroup } from "@/lib/fe/rules";

export function TrackingSummaryView({ groups }: { groups: TrackingGroup[] }) {
  const { theme } = useTheme();

  return (
    <View style={styles.stack}>
      {groups.map((group) => (
        <View
          key={group.title}
          style={[styles.card, { backgroundColor: theme.backgroundDefault }]}
        >
          <ThemedText type="h4" style={styles.cardTitle}>
            {group.title}
          </ThemedText>
          {group.facts.map((fact, index) => (
            <View
              key={fact.label}
              style={[
                styles.factRow,
                index > 0 && {
                  borderTopWidth: 1,
                  borderTopColor: theme.border,
                },
              ]}
            >
              <ThemedText type="body" style={styles.factLabel}>
                {fact.label}
              </ThemedText>
              <View style={styles.factValue}>
                {fact.enabled !== null ? (
                  <Feather
                    name={fact.enabled ? "check-circle" : "x-circle"}
                    size={16}
                    color={fact.enabled ? theme.success : theme.textSecondary}
                  />
                ) : null}
                <ThemedText
                  type="body"
                  style={[
                    styles.factValueText,
                    {
                      color:
                        fact.enabled === false
                          ? theme.textSecondary
                          : theme.text,
                    },
                  ]}
                >
                  {fact.value}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export function RuleSectionsView({
  sections,
  expandFirst = false,
}: {
  sections: RuleSection[];
  expandFirst?: boolean;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.sections}>
      {sections.map((section, index) => (
        <CollapsibleSection
          key={section.key}
          title={`${section.title} (${section.items.length})`}
          defaultExpanded={expandFirst && index === 0}
        >
          {section.items.map((rule) => (
            <View
              key={rule.flags.join(" ") || rule.title}
              style={[styles.rule, { borderBottomColor: theme.border }]}
            >
              <ThemedText type="body" style={styles.ruleTitle}>
                {rule.title}
              </ThemedText>
              {rule.description ? (
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {rule.description}
                </ThemedText>
              ) : null}
              {rule.flags.length > 0 ? (
                <ThemedText
                  type="small"
                  style={[styles.flagName, { color: theme.textSecondary }]}
                >
                  {rule.flags.join(" ")}
                </ThemedText>
              ) : null}
            </View>
          ))}
        </CollapsibleSection>
      ))}
    </View>
  );
}

export function FlagStringView({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.flagBox, { backgroundColor: theme.backgroundDefault }]}
    >
      <ThemedText
        type="small"
        style={[styles.flagLabel, { color: theme.textSecondary }]}
      >
        {label}
      </ThemedText>
      <ThemedText type="small" style={styles.mono} selectable>
        {value}
      </ThemedText>
    </View>
  );
}

const MONO = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  cardTitle: {
    marginBottom: Spacing.sm,
  },
  factRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  factLabel: {
    flexShrink: 1,
  },
  factValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    flexShrink: 1,
  },
  factValueText: {
    fontWeight: "600",
    textAlign: "right",
    flexShrink: 1,
  },
  sections: {
    gap: Spacing.sm,
  },
  rule: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    gap: Spacing.xs,
  },
  ruleTitle: {
    fontWeight: "500",
  },
  flagName: {
    fontFamily: MONO,
    fontSize: 12,
  },
  flagBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    gap: Spacing.xs,
  },
  flagLabel: {
    fontWeight: "600",
  },
  mono: {
    fontFamily: MONO,
    fontSize: 13,
    lineHeight: 19,
  },
});

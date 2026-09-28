import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "expo-router/react-navigation";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function AboutScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h3" style={styles.title}>
            Free Enterpriser
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Version 1.0.0
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            What is this app?
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            Free Enterpriser is a companion app for Final Fantasy IV: Free Enterprise randomizer runs. 
            It helps you track your progress through randomized games by keeping track of which 
            locations you've checked, what key items you've found, and which shops you've visited.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            What is Free Enterprise?
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            Free Enterprise is a randomizer for Final Fantasy IV (originally released as Final Fantasy II 
            in North America). It shuffles key items, character locations, boss encounters, and more to 
            create unique gameplay experiences every run.
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            Each run is generated with specific flags that determine what's randomized and what optional 
            content is available, such as Summon Quest rewards, Lunar Subterrane bosses, and 
            Monster-in-a-Box chests.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Features
          </ThemedText>
          <ThemedText style={styles.listItem}>
            Track key item location checks during your run
          </ThemedText>
          <ThemedText style={styles.listItem}>
            Mark shops you've visited and items worth returning for
          </ThemedText>
          <ThemedText style={styles.listItem}>
            Configure runs with specific flags (Summon Quest, Lunar Sub bosses, MIAB, Toroia free item)
          </ThemedText>
          <ThemedText style={styles.listItem}>
            View your run history with completion times
          </ThemedText>
          <ThemedText style={styles.listItem}>
            Reference guides for vanilla story events, shop locations, and key item information
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Tips
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            Long-press on any location or shop to mark it for return later. This is useful when you 
            find something good but can't access it yet, or when a shop has items you want to buy 
            once you have more gold.
          </ThemedText>
        </View>

        <ThemedText type="small" style={[styles.footer, { color: theme.textSecondary }]}>
          Made with love for the FF4 Free Enterprise community
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  paragraph: {
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  listItem: {
    marginBottom: Spacing.xs,
    paddingLeft: Spacing.sm,
  },
  footer: {
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});

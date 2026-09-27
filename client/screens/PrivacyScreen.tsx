import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "expo-router/react-navigation";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function PrivacyScreen() {
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
        <View style={[styles.section, { backgroundColor: theme.backgroundElevated }]}>
          <ThemedText type="title" style={styles.title}>
            Privacy Policy
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Last updated: January 2026
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundElevated }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Overview
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            Free Enterpriser ("the App") is committed to protecting your privacy. This Privacy Policy 
            explains how we handle information when you use our mobile application.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundElevated }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Data Collection
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            The App stores all data locally on your device. We do not collect, transmit, or store any 
            personal information on external servers. Your run history, settings, and preferences remain 
            entirely on your device.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundElevated }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Local Storage
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            The App uses local storage on your device to save:
          </ThemedText>
          <ThemedText style={styles.listItem}>
            Current run progress and checked locations
          </ThemedText>
          <ThemedText style={styles.listItem}>
            Completed run history and statistics
          </ThemedText>
          <ThemedText style={styles.listItem}>
            App preferences and settings
          </ThemedText>
          <ThemedText style={[styles.paragraph, { marginTop: Spacing.sm }]}>
            This data is stored locally using your device's secure storage mechanisms and is not 
            accessible to other applications or transmitted over the internet.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundElevated }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Third-Party Services
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            The App does not integrate with any third-party analytics, advertising, or tracking services. 
            We do not share any information with third parties.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundElevated }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Data Deletion
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            You can delete all App data at any time by uninstalling the application from your device. 
            Individual runs can be deleted from within the App through the History tab.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundElevated }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Children's Privacy
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            The App does not knowingly collect any information from children. Since no personal 
            information is collected from any user, there is no risk of collecting children's data.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundElevated }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Changes to This Policy
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            We may update this Privacy Policy from time to time. Any changes will be reflected in the 
            "Last updated" date at the top of this policy. We encourage you to review this policy 
            periodically.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundElevated }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Contact
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us through the 
            application's support channels.
          </ThemedText>
        </View>
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
});

import React, { useState, useCallback } from "react";
import { View, StyleSheet, TextInput, Switch, Alert, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { CurrentRunStackParamList } from "@/navigation/CurrentRunStackNavigator";
import { RunFlags } from "@/types";
import { saveActiveRun } from "@/lib/storage";
import { initializeShopVisits, initializeKeyItemChecks, generateRunId } from "@/lib/data";
import { TouchableOpacity } from "react-native-gesture-handler";

type NavigationProp = NativeStackNavigationProp<CurrentRunStackParamList>;

export default function NewRunScreen() {
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  console.log("blah")

  const [name, setName] = useState("");
  const [flags, setFlags] = useState<RunFlags>({
    summonQuestRewards: false,
    lunarSubterraneBosses: false,
    monsterInABox: false,
    freeItemToroia: true,
  });

  const [shouldLeaveScreen, setShouldLeaveScreen] = useState(false);

  const handleCancel = useCallback(() => {
    console.log("Cancel pressed")
    setShouldLeaveScreen(true)
  }, [navigation]);

  const handleStartRun = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a name for your run");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newRun = {
      id: generateRunId(),
      name: name.trim(),
      flags,
      shopVisits: initializeShopVisits(),
      keyItemChecks: initializeKeyItemChecks(flags),
      startedAt: new Date().toISOString(),
    };

    await saveActiveRun(newRun);
    setShouldLeaveScreen(true)
  }, [name, flags, navigation]);

  React.useEffect(() => {
    if (shouldLeaveScreen) {
      console.log("Leaving screen")
      navigation.goBack();
    }
  }, [shouldLeaveScreen, navigation])

  React.useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleCancel} hitSlop={8} style={{ paddingHorizontal: 8 }}>
          <ThemedText style={{ color: theme.primary }}>Cancel</ThemedText>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleStartRun} hitSlop={8} style={{ paddingHorizontal: 8 }}>
          <ThemedText style={{ color: theme.primary, fontWeight: "600" }}>
            Start
          </ThemedText>
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme, handleCancel, handleStartRun]);

  const toggleFlag = (key: keyof RunFlags) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.scrollView, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.section}>
        <ThemedText type="body" style={styles.label}>
          Run Name
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          value={name}
          onChangeText={setName}
          placeholder="Enter a name for this run"
          placeholderTextColor={theme.textSecondary}
          autoFocus
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Key Item Locations
        </ThemedText>
        <ThemedText
          type="small"
          style={[styles.sectionDescription, { color: theme.textSecondary }]}
        >
          Select where key items can be located in this run
        </ThemedText>

        <View style={styles.toggleList}>
          <View
            style={[styles.toggleRow, { borderBottomColor: theme.border }]}
          >
            <View style={styles.toggleInfo}>
              <ThemedText type="body">Summon Quest Rewards</ThemedText>
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary }}
              >
                Asura, Leviathan, Sylph, Odin, Bahamut
              </ThemedText>
            </View>
            <Switch
              value={flags.summonQuestRewards}
              onValueChange={() => toggleFlag("summonQuestRewards")}
              trackColor={{ false: theme.border, true: theme.primary + "80" }}
              thumbColor={flags.summonQuestRewards ? theme.primary : "#f4f3f4"}
            />
          </View>

          <View
            style={[styles.toggleRow, { borderBottomColor: theme.border }]}
          >
            <View style={styles.toggleInfo}>
              <ThemedText type="body">Lunar Subterrane Bosses</ThemedText>
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary }}
              >
                Four Fiend rematches and final bosses
              </ThemedText>
            </View>
            <Switch
              value={flags.lunarSubterraneBosses}
              onValueChange={() => toggleFlag("lunarSubterraneBosses")}
              trackColor={{ false: theme.border, true: theme.primary + "80" }}
              thumbColor={flags.lunarSubterraneBosses ? theme.primary : "#f4f3f4"}
            />
          </View>

          <View
            style={[styles.toggleRow, { borderBottomColor: theme.border }]}
          >
            <View style={styles.toggleInfo}>
              <ThemedText type="body">Monster-in-a-Box Chests</ThemedText>
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary }}
              >
                MIAB chests can contain key items
              </ThemedText>
            </View>
            <Switch
              value={flags.monsterInABox}
              onValueChange={() => toggleFlag("monsterInABox")}
              trackColor={{ false: theme.border, true: theme.primary + "80" }}
              thumbColor={flags.monsterInABox ? theme.primary : "#f4f3f4"}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <ThemedText type="body">Free Item in Toroia</ThemedText>
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary }}
              >
                Edward in bed gives a free key item
              </ThemedText>
            </View>
            <Switch
              value={flags.freeItemToroia}
              onValueChange={() => toggleFlag("freeItemToroia")}
              trackColor={{ false: theme.border, true: theme.primary + "80" }}
              thumbColor={flags.freeItemToroia ? theme.primary : "#f4f3f4"}
            />
          </View>
        </View>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing["2xl"],
  },
  section: {
    gap: Spacing.sm,
  },
  label: {
    fontWeight: "500",
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    marginBottom: Spacing.md,
  },
  toggleList: {
    gap: 0,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  toggleInfo: {
    flex: 1,
    marginRight: Spacing.md,
    gap: Spacing.xs,
  },
});

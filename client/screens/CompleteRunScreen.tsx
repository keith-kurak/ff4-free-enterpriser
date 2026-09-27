import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import { useNavigation } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ActiveRun, CompletedRun, CHARACTERS, Character } from "@/types";
import { getActiveRun, clearActiveRun, saveCompletedRun } from "@/lib/storage";
import { TouchableOpacity } from "react-native-gesture-handler";


export default function CompleteRunScreen() {
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [activeRun, setActiveRun] = useState<ActiveRun | null>(null);
  const [completionTime, setCompletionTime] = useState("");
  const [keyItemsCollected, setKeyItemsCollected] = useState("");
  const [treasureChests, setTreasureChests] = useState("");
  const [characterCount, setCharacterCount] = useState("");
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);

  useEffect(() => {
    loadActiveRun();
  }, []);

  const loadActiveRun = async () => {
    const run = await getActiveRun();
    setActiveRun(run);
  };

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSave = useCallback(async () => {
    if (!activeRun) return;

    if (!completionTime.trim()) {
      Alert.alert("Error", "Please enter your completion time");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const completedRun: CompletedRun = {
      id: activeRun.id,
      name: activeRun.name,
      flags: activeRun.flags,
      completionTime: completionTime.trim(),
      keyItemsCollected: keyItemsCollected ? parseInt(keyItemsCollected, 10) : undefined,
      treasureChests: treasureChests ? parseInt(treasureChests, 10) : undefined,
      characterCount: characterCount ? parseInt(characterCount, 10) : undefined,
      finalParty: selectedCharacters,
      shopVisits: activeRun.shopVisits,
      keyItemChecks: activeRun.keyItemChecks,
      completedAt: new Date().toISOString(),
      startedAt: activeRun.startedAt,
    };

    await saveCompletedRun(completedRun);
    await clearActiveRun();
    navigation.goBack();
  }, [activeRun, completionTime, keyItemsCollected, treasureChests, characterCount, selectedCharacters, navigation]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleCancel} hitSlop={8} style={{ paddingHorizontal: 8 }}>
          <ThemedText style={{ color: theme.primary }}>Cancel</ThemedText>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} hitSlop={8} style={{ paddingHorizontal: 8 }}>
          <ThemedText style={{ color: theme.primary, fontWeight: "600" }}>
            Save
          </ThemedText>
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme, handleCancel, handleSave]);

  const toggleCharacter = (character: Character) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCharacters((prev) =>
      prev.includes(character)
        ? prev.filter((c) => c !== character)
        : [...prev, character]
    );
  };

  if (!activeRun) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: headerHeight }]}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

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
      <ThemedText type="h4" style={styles.runName}>
        {activeRun.name}
      </ThemedText>

      <View style={styles.section}>
        <ThemedText type="body" style={styles.label}>
          Completion Time *
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              borderColor: theme.primary,
              borderWidth: 2,
            },
          ]}
          value={completionTime}
          onChangeText={setCompletionTime}
          placeholder="e.g., 1:45:30"
          placeholderTextColor={theme.textSecondary}
          autoFocus
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.section, styles.halfWidth]}>
          <ThemedText type="body" style={styles.label}>
            Key Items
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
            value={keyItemsCollected}
            onChangeText={setKeyItemsCollected}
            placeholder="0"
            placeholderTextColor={theme.textSecondary}
            keyboardType="number-pad"
          />
        </View>

        <View style={[styles.section, styles.halfWidth]}>
          <ThemedText type="body" style={styles.label}>
            Treasure Chests
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
            value={treasureChests}
            onChangeText={setTreasureChests}
            placeholder="0"
            placeholderTextColor={theme.textSecondary}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="body" style={styles.label}>
          Character Count
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
          value={characterCount}
          onChangeText={setCharacterCount}
          placeholder="0"
          placeholderTextColor={theme.textSecondary}
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="body" style={styles.label}>
          Final Party
        </ThemedText>
        <View style={styles.characterGrid}>
          {CHARACTERS.map((character) => {
            const isSelected = selectedCharacters.includes(character);
            return (
              <Pressable
                key={character}
                onPress={() => toggleCharacter(character)}
                style={[
                  styles.characterChip,
                  {
                    backgroundColor: isSelected
                      ? theme.primary
                      : theme.backgroundDefault,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
              >
                {isSelected ? (
                  <Feather name="check" size={14} color="#fff" />
                ) : null}
                <ThemedText
                  type="small"
                  style={{
                    color: isSelected ? "#fff" : theme.text,
                  }}
                >
                  {character}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
  },
  runName: {
    marginBottom: Spacing.sm,
  },
  section: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfWidth: {
    flex: 1,
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
  characterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  characterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
});

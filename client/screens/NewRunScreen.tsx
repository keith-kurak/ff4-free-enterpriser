import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Switch,
  Alert,
  Pressable,
} from "react-native";
import { useNavigation } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import {
  RuleSectionsView,
  TrackingSummaryView,
} from "@/components/RunRulesView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { FlagInputMethod, Run } from "@/types";
import { saveCurrentRun } from "@/lib/runs";
import { generateRunId } from "@/lib/data";
import { FE_VERSION } from "@/lib/fe/flagset";
import {
  MANUAL_FLAG_GROUPS,
  readFlagInput,
  readManualFlags,
} from "@/lib/fe/input";
import { rulesForRun } from "@/lib/fe/rules";
import { TouchableOpacity } from "react-native-gesture-handler";

const METHODS: { key: FlagInputMethod; label: string }[] = [
  { key: "flagset", label: "Flagset" },
  { key: "code", label: "Code" },
  { key: "manual", label: "Manual" },
];

function defaultRunName() {
  const date = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `Run on ${date}`;
}

export default function NewRunScreen() {
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [name, setName] = useState("");
  const [method, setMethod] = useState<FlagInputMethod>("flagset");
  const [flagText, setFlagText] = useState("");
  const [codeText, setCodeText] = useState("");
  const [manualFlags, setManualFlags] = useState<string[]>([]);

  const [shouldLeaveScreen, setShouldLeaveScreen] = useState(false);

  const input =
    method === "flagset" ? flagText : method === "code" ? codeText : "";
  const result = useMemo(
    () =>
      method === "manual"
        ? readManualFlags(manualFlags)
        : readFlagInput(method, input),
    [method, input, manualFlags],
  );
  const rules = useMemo(
    () =>
      result.ok
        ? rulesForRun({ inputMethod: method, flags: result.flagString })
        : null,
    [result, method],
  );

  const handleCancel = useCallback(() => {
    setShouldLeaveScreen(true);
  }, []);

  const handleStartRun = useCallback(async () => {
    if (!result.ok) {
      Alert.alert("Cannot start run", result.error);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const run: Run = {
      schemaVersion: 2,
      id: generateRunId(),
      name: name.trim() || defaultRunName(),
      inputMethod: method,
      input: input.trim(),
      flags: result.flagString,
      flagCode: result.binary,
      feVersion: FE_VERSION,
      startedAt: new Date().toISOString(),
    };

    await saveCurrentRun(run);
    setShouldLeaveScreen(true);
  }, [name, method, input, result]);

  React.useEffect(() => {
    if (shouldLeaveScreen) {
      navigation.goBack();
    }
  }, [shouldLeaveScreen, navigation]);

  React.useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={handleCancel}
          hitSlop={8}
          style={{ paddingHorizontal: 8 }}
        >
          <ThemedText style={{ color: theme.primary }}>Cancel</ThemedText>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={handleStartRun}
          hitSlop={8}
          style={{ paddingHorizontal: 8 }}
        >
          <ThemedText
            style={{
              color: result.ok ? theme.primary : theme.textSecondary,
              fontWeight: "600",
            }}
          >
            Start
          </ThemedText>
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme, handleCancel, handleStartRun, result.ok]);

  const selectMethod = (next: FlagInputMethod) => {
    if (next === method) return;
    Haptics.selectionAsync();
    setMethod(next);
  };

  const toggleManualFlag = (flag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setManualFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag],
    );
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.backgroundDefault,
      color: theme.text,
      borderColor: theme.border,
    },
  ];

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
          style={inputStyle}
          value={name}
          onChangeText={setName}
          placeholder={defaultRunName()}
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="body" style={styles.label}>
          Flags
        </ThemedText>
        <View
          style={[
            styles.segmented,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          {METHODS.map((m) => {
            const selected = m.key === method;
            return (
              <Pressable
                key={m.key}
                onPress={() => selectMethod(m.key)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.segment,
                  selected && { backgroundColor: theme.primary },
                ]}
              >
                <ThemedText
                  type="small"
                  style={[
                    styles.segmentText,
                    { color: selected ? theme.buttonText : theme.text },
                  ]}
                >
                  {m.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        {method === "flagset" ? (
          <>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Paste the flags from ff4fe.com (FE v{FE_VERSION}).
            </ThemedText>
            <TextInput
              style={[inputStyle, styles.multiline]}
              value={flagText}
              onChangeText={setFlagText}
              placeholder="O1:quest_forge/random:6 Kmain/summon/moon Pkey Cstandard/nofree …"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              multiline
              textAlignVertical="top"
            />
          </>
        ) : null}

        {method === "code" ? (
          <>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Paste the short flag code from ff4fe.com. It starts with
              &quot;b&quot;.
            </ThemedText>
            <TextInput
              style={inputStyle}
              value={codeText}
              onChangeText={setCodeText}
              placeholder="bBAYAIAUAAAAAAGB…"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            />
          </>
        ) : null}

        {method === "manual" ? (
          <>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Set only the flags you need for tracking. Key items are always
              randomized.
            </ThemedText>
            {MANUAL_FLAG_GROUPS.map((group) => (
              <View key={group.title} style={styles.manualGroup}>
                <ThemedText
                  type="small"
                  style={[styles.groupTitle, { color: theme.textSecondary }]}
                >
                  {group.title}
                </ThemedText>
                {group.options.map((option, index) => {
                  const on = manualFlags.includes(option.flag);
                  return (
                    <View
                      key={option.flag}
                      style={[
                        styles.toggleRow,
                        index < group.options.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: theme.border,
                        },
                      ]}
                    >
                      <View style={styles.toggleInfo}>
                        <ThemedText type="body">{option.title}</ThemedText>
                        <ThemedText
                          type="small"
                          style={{ color: theme.textSecondary }}
                        >
                          {option.description}
                        </ThemedText>
                      </View>
                      <Switch
                        value={on}
                        onValueChange={() => toggleManualFlag(option.flag)}
                        trackColor={{
                          false: theme.border,
                          true: theme.primary + "80",
                        }}
                        thumbColor={on ? theme.primary : "#f4f3f4"}
                      />
                    </View>
                  );
                })}
              </View>
            ))}
          </>
        ) : null}
      </View>

      {!result.ok && input.trim() ? (
        <View style={[styles.notice, { backgroundColor: theme.danger + "1A" }]}>
          <Feather name="alert-circle" size={16} color={theme.danger} />
          <ThemedText
            type="small"
            style={[styles.noticeText, { color: theme.danger }]}
          >
            {result.error}
          </ThemedText>
        </View>
      ) : null}

      {result.ok && method !== "manual" && result.warnings.length > 0 ? (
        <View
          style={[styles.notice, { backgroundColor: theme.warning + "26" }]}
        >
          <Feather name="alert-triangle" size={16} color={theme.text} />
          <View style={styles.noticeText}>
            {result.warnings.map((w) => (
              <ThemedText key={w} type="small">
                {w}
              </ThemedText>
            ))}
          </View>
        </View>
      ) : null}

      {result.ok && method !== "manual" && result.corrections.length > 0 ? (
        <View
          style={[styles.notice, { backgroundColor: theme.backgroundDefault }]}
        >
          <Feather name="info" size={16} color={theme.textSecondary} />
          <View style={styles.noticeText}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              ff4fe.com would change these flags:
            </ThemedText>
            {result.corrections.map((c) => (
              <ThemedText
                key={c}
                type="small"
                style={{ color: theme.textSecondary }}
              >
                • {c}
              </ThemedText>
            ))}
          </View>
        </View>
      ) : null}

      {rules ? (
        <View style={styles.section}>
          <ThemedText type="h4">Rules for this run</ThemedText>
          <TrackingSummaryView groups={rules.tracking} />
          {method !== "manual" ? (
            <RuleSectionsView sections={rules.sections} />
          ) : null}
        </View>
      ) : null}
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
    minHeight: Spacing.inputHeight,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  multiline: {
    minHeight: 120,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  segmented: {
    flexDirection: "row",
    borderRadius: BorderRadius.xs,
    padding: 3,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs - 2,
  },
  segmentText: {
    fontWeight: "600",
  },
  manualGroup: {
    marginTop: Spacing.sm,
  },
  groupTitle: {
    fontWeight: "600",
    textTransform: "uppercase",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  toggleInfo: {
    flex: 1,
    marginRight: Spacing.md,
    gap: Spacing.xs,
  },
  notice: {
    flexDirection: "row",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    alignItems: "flex-start",
  },
  noticeText: {
    flex: 1,
    gap: Spacing.xs,
  },
});

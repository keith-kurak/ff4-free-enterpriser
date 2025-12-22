import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface CheckboxRowProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
  showReturn?: boolean;
  returnChecked?: boolean;
  onLongPress?: () => void;
}

export function CheckboxRow({
  label,
  checked,
  onToggle,
  showReturn = false,
  returnChecked = false,
  onLongPress,
}: CheckboxRowProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.border }, showReturn && { backgroundColor: theme.warning + "0D" }]}>
      <Pressable
        onPress={onToggle}
        onLongPress={onLongPress}
        delayLongPress={300}
        style={({ pressed }) => [
          styles.checkboxArea,
          pressed && { opacity: 0.7 },
        ]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: checked ? theme.primary : "transparent",
              borderColor: checked ? theme.primary : theme.border,
            },
          ]}
        >
          {checked ? <Feather name="check" size={14} color="#fff" /> : null}
        </View>
        <ThemedText
          type="small"
          style={[styles.label, checked && { textDecorationLine: "line-through", opacity: 0.6 }]}
          numberOfLines={2}
        >
          {label}
        </ThemedText>
      </Pressable>

      {showReturn ? (
        <View style={[styles.returnIndicator, { backgroundColor: theme.warning }]}>
          <Feather name="corner-down-left" size={12} color="#fff" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  checkboxArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    minHeight: 44,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    flex: 1,
  },
  returnIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.sm,
  },
});

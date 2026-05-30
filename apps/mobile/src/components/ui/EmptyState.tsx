import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { theme } from "@/theme";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * EmptyState — matches the web app's empty state patterns
 */
export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  icon,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <Button
          variant="outline"
          size="sm"
          onPress={onAction}
          style={styles.action}
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
    minHeight: 200,
  },
  iconWrapper: {
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: theme.colors.foreground,
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    textAlign: "center",
    lineHeight: 20,
  },
  action: {
    marginTop: 16,
  },
});
import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { theme } from "@/theme";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

/**
 * Badge — matches the web app's Badge component styling
 * Ref: src/components/ui/badge.tsx
 */
export function Badge({ children, variant = "default", style }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], style]}>
      <Text style={textStyles[variant]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  default: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  destructive: {
    backgroundColor: theme.colors.destructive,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});

const textStyles: Record<BadgeVariant, any> = {
  default: {
    color: theme.colors.primaryForeground,
  },
  secondary: {
    color: theme.colors.secondaryForeground,
  },
  destructive: {
    color: "#FFFFFF",
  },
  outline: {
    color: theme.colors.foreground,
  },
};
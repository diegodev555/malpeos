import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { glassSurface, glassSurfaceDark } from "@/styles/glass";
import { theme } from "@/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  dark?: boolean;
  size?: "default" | "sm";
}

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * AppCard — matches the web app's Card component
 * Ref: src/components/ui/card.tsx + .glass-surface CSS class
 */
export function Card({ children, style, dark = false, size = "default" }: CardProps) {
  return (
    <View
      style={[
        dark ? glassSurfaceDark : glassSurface,
        size === "sm" ? styles.cardSmall : styles.cardDefault,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children, style }: CardHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      {children}
    </View>
  );
}

export function CardTitle({ children, style }: CardTitleProps) {
  return (
    <Text style={[styles.title, style]}>
      {children}
    </Text>
  );
}

export function CardContent({ children, style }: CardContentProps) {
  return (
    <View style={[styles.content, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  cardDefault: {
    padding: 16,
    marginBottom: 12,
  },
  cardSmall: {
    padding: 12,
    marginBottom: 12,
  },
  header: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.3,
    color: theme.colors.foreground,
  },
  content: {},
});
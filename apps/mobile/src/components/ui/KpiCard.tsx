import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import { theme } from "@/theme";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  positive?: boolean;
  color?: string;
}

/**
 * KpiCard — matches the web app's dashboard KPI cards
 * Ref: src/app/page.tsx — KPI Cards section
 */
export function KpiCard({
  title,
  value,
  subtitle,
  positive,
  color,
}: KpiCardProps) {
  const valueColor = color
    ? color
    : positive !== undefined
    ? positive
      ? theme.colors.success
      : theme.colors.destructive
    : theme.colors.foreground;

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  value: {
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
  },
});
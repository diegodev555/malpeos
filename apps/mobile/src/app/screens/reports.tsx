import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { theme } from "@/theme";

export default function ReportsScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>Financial reports and analytics</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: "700", color: theme.colors.malpeosDark },
  subtitle: { fontSize: 13, color: theme.colors.mutedForeground, marginTop: 2 },
});
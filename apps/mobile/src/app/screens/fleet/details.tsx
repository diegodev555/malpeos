import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { theme } from "@/theme";

export default function FleetDetailsScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Fleet Details</Text>
        <Text style={styles.subtitle}>Detailed fleet information and history</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: "700", color: theme.colors.malpeosDark },
  subtitle: { fontSize: 13, color: theme.colors.mutedForeground, marginTop: 2 },
});
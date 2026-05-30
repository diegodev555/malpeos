import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { theme } from "@/theme";
import { useFocusEffect } from "expo-router";
import { useMoreSheet } from "@/components/MoreSheetProvider";

export default function MoreScreen() {
  const { showMoreSheet } = useMoreSheet();

  // Auto-open the bottom sheet when More tab is focused
  useFocusEffect(
    React.useCallback(() => {
      showMoreSheet();
    }, [showMoreSheet])
  );

  // Dashboard is the initial route, so this will never actually show
  // The sheet will open on top when More is pressed
  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>More</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.malpeosDark,
  },
});
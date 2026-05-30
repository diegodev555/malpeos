import React from "react";
import { Text, StyleSheet, Platform } from "react-native";

interface HapticTabButtonProps {
  icon: string;
  focused: boolean;
}

export function HapticTabButton({ icon, focused }: HapticTabButtonProps) {
  return (
    <Text
      style={[
        styles.icon,
        {
          fontSize: focused ? 26 : 24,
          opacity: focused ? 1 : 0.6,
          marginTop: Platform.OS === "ios" ? 6 : 4,
        },
      ]}
    >
      {icon}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    includeFontPadding: false,
    textAlign: "center",
  },
});
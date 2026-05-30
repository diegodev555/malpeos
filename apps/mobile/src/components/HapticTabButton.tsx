import React from "react";
import { StyleSheet, Platform, ImageSourcePropType, Image as RNImage } from "react-native";

interface HapticTabButtonProps {
  icon: ImageSourcePropType;
  focused: boolean;
}

export function HapticTabButton({ icon, focused }: HapticTabButtonProps) {
  const iconSize = focused ? 28 : 24;
  
  return (
    <RNImage
      source={icon}
      style={[
        styles.icon,
        {
          width: iconSize,
          height: iconSize,
          opacity: focused ? 1 : 0.6,
          marginTop: Platform.OS === "ios" ? 6 : 4,
          tintColor: focused ? "#0B3C64" : "#6B7280",
        },
      ]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    alignSelf: "center",
  },
});
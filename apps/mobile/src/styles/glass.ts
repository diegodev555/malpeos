// Glass surface styles matching the web app's CSS glass-surface class
// Ref: src/app/globals.css — .glass-surface, .glass-control

import { ViewStyle, TextStyle, ImageStyle } from "react-native";
import { theme } from "@/theme";

export const glassSurface: ViewStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.66)",
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.60)",
  borderRadius: theme.borderRadius.lg,
  // Shadow matching box-shadow from CSS
  shadowColor: "rgba(0, 0, 0, 0.08)",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 10,
  elevation: 4,
};

export const glassSurfaceDark: ViewStyle = {
  backgroundColor: "rgba(30, 30, 30, 0.85)",
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.10)",
  borderRadius: theme.borderRadius.lg,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 10,
  elevation: 4,
};

export const glassControl: ViewStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.70)",
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.60)",
  borderRadius: 12,
  shadowColor: "rgba(0, 0, 0, 0.06)",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 2,
};

export const cardStyle: ViewStyle = {
  ...glassSurface,
  padding: 16,
  marginBottom: 12,
};

export const cardSmall: ViewStyle = {
  ...glassSurface,
  padding: 12,
  marginBottom: 12,
};

// Gradient background matching the web body
export const screenBackground = {
  backgroundColor: theme.colors.background,
};

export const headerBar: ViewStyle = {
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  paddingHorizontal: 16,
  paddingVertical: 12,
  backgroundColor: "rgba(255, 255, 255, 0.54)",
  borderBottomWidth: 1,
  borderBottomColor: "rgba(255, 255, 255, 0.52)",
};
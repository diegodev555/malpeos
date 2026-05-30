import React from "react";
import { View, Text, ViewStyle } from "react-native";
import { cn } from "@/lib/cn";

interface BadgeProps {
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<string, ViewStyle> = {
  default: { backgroundColor: "oklch(0.46 0.145 223)", paddingHorizontal: 8, paddingVertical: 2 },
  secondary: { backgroundColor: "oklch(0.94 0.035 193 / 0.72)", paddingHorizontal: 8, paddingVertical: 2 },
  destructive: { backgroundColor: "rgba(220, 38, 38, 0.1)", paddingHorizontal: 8, paddingVertical: 2 },
  outline: { backgroundColor: "transparent", paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: "rgba(255,255,255,0.54)" },
};

const variantTextColors: Record<string, string> = {
  default: "#ffffff",
  secondary: "oklch(0.25 0.063 222)",
  destructive: "oklch(0.577 0.245 27.325)",
  outline: "oklch(0.18 0.032 246)",
};

export function Badge({ variant = "default", className, children }: BadgeProps) {
  return (
    <View
      className={cn("rounded-full", className)}
      style={[
        variantStyles[variant],
        {
          borderRadius: 9999,
          alignSelf: "flex-start",
        },
      ]}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: variantTextColors[variant],
        }}
      >
        {children}
      </Text>
    </View>
  );
}
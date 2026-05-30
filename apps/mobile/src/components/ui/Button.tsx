import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { theme } from "@/theme";
import { glassControl } from "@/styles/glass";

type ButtonVariant = "default" | "primary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "default" | "lg" | "icon";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * AppButton — matches the web app's Button component styling
 * Ref: src/components/ui/button.tsx
 */
export function Button({
  children,
  onPress,
  variant = "default",
  size = "default",
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        styles[`variant_${variant}`],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "default" || variant === "primary"
              ? theme.colors.primaryForeground
              : theme.colors.primary
          }
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`text_${variant}`],
            styles[`textSize_${size}`],
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    gap: 6,
  },
  // Variants
  variant_default: {
    backgroundColor: theme.colors.primary,
  },
  variant_primary: {
    backgroundColor: theme.colors.primary,
  },
  variant_outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  variant_ghost: {
    backgroundColor: "transparent",
  },
  variant_destructive: {
    backgroundColor: theme.colors.destructive,
  },
  // Sizes
  size_default: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  size_sm: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  size_lg: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  size_icon: {
    width: 36,
    height: 36,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  // Text styles
  text: {
    fontWeight: "600",
    fontSize: 14,
  },
  text_default: {
    color: theme.colors.primaryForeground,
  },
  text_primary: {
    color: theme.colors.primaryForeground,
  },
  text_outline: {
    color: theme.colors.foreground,
  },
  text_ghost: {
    color: theme.colors.foreground,
  },
  text_destructive: {
    color: "#FFFFFF",
  },
  textSize_sm: {
    fontSize: 13,
  },
  textSize_default: {
    fontSize: 14,
  },
  textSize_lg: {
    fontSize: 16,
  },
  textSize_icon: {
    fontSize: 14,
  },
});
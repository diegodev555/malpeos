import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { cn } from "@/lib/cn";

interface ButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "xs" | "sm" | "lg" | "icon";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  className?: string;
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
  onPress?: () => void;
}

/**
 * Button component — matches the web app's button design system
 * Ref: src/components/ui/button.tsx
 */
export function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  icon,
  iconPosition = "left",
  children,
  disabled,
  style,
  onPress,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const variantStyles: Record<string, ViewStyle> = {
    default: {
      backgroundColor: "oklch(0.46 0.145 223)",
      shadowColor: "oklch(0.46 0.145 223 / 0.22)",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.22,
      shadowRadius: 24,
      elevation: 8,
    },
    outline: {
      backgroundColor: "rgba(255,255,255,0.45)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.6)",
    },
    secondary: {
      backgroundColor: "oklch(0.94 0.035 193 / 0.72)",
    },
    ghost: {},
    destructive: {
      backgroundColor: "rgba(220, 38, 38, 0.1)",
    },
    link: {
      backgroundColor: "transparent",
    },
  };

  const sizeStyles: Record<string, ViewStyle> = {
    default: { height: 36, paddingHorizontal: 12, gap: 6 },
    xs: { height: 24, paddingHorizontal: 8, gap: 4 },
    sm: { height: 28, paddingHorizontal: 10, gap: 4 },
    lg: { height: 40, paddingHorizontal: 16, gap: 6 },
    icon: { width: 36, height: 36 },
  };

  const textColors: Record<string, string> = {
    default: "#ffffff",
    outline: "oklch(0.18 0.032 246)",
    secondary: "oklch(0.25 0.063 222)",
    ghost: "oklch(0.48 0.048 235)",
    destructive: "oklch(0.577 0.245 27.325)",
    link: "oklch(0.46 0.145 223)",
  };

  const fontSizes: Record<string, number> = {
    default: 14, xs: 12, sm: 12.8, lg: 14, icon: 14,
  };

  return (
    <TouchableOpacity
      disabled={isDisabled}
      onPress={onPress}
      className={cn(
        "flex-row items-center justify-center rounded-xl",
        isDisabled && "opacity-50",
        className
      )}
      style={[
        variantStyles[variant],
        sizeStyles[size],
        size === "icon" && { paddingHorizontal: 0 },
        style as any,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColors[variant]} />
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          {typeof children === "string" ? (
            <Text style={{ fontSize: fontSizes[size], fontWeight: "600", color: textColors[variant] }}>
              {children}
            </Text>
          ) : (
            children
          )}
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </TouchableOpacity>
  );
}
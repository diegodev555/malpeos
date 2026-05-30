import React from "react";
import { View, Text, ViewProps, ViewStyle } from "react-native";
import { cn } from "@/lib/cn";

interface CardProps {
  size?: "default" | "sm";
  className?: string;
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
}

/**
 * Card component — matches the web app's glass-surface card design
 * Ref: src/components/ui/card.tsx + globals.css .glass-surface
 */
export function Card({ className, size = "default", style, children }: CardProps) {
  return (
    <View
      className={cn(
        "rounded-2xl overflow-hidden",
        size === "default" ? "py-4" : "py-3",
        className
      )}
      style={[
        {
          backgroundColor: "rgba(255,255,255,0.66)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.6)",
          shadowColor: "rgba(13, 27, 68, 0.13)",
          shadowOffset: { width: 0, height: 18 },
          shadowOpacity: 1,
          shadowRadius: 50,
          elevation: 10,
        },
        style as any,
      ]}
    >
      {children}
    </View>
  );
}

interface CardHeaderProps {
  className?: string;
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
}

export function CardHeader({ className, style, children }: CardHeaderProps) {
  return (
    <View
      className={cn("px-5 flex-row items-center justify-between", className)}
      style={style as any}
    >
      {children}
    </View>
  );
}

interface CardTitleProps {
  className?: string;
  children?: React.ReactNode;
}

export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <Text className={cn("font-semibold", className)} style={{ fontSize: 16.8 } as any}>
      {children}
    </Text>
  );
}

interface CardContentProps {
  className?: string;
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
}

export function CardContent({ className, style, children }: CardContentProps) {
  return (
    <View className={cn("px-5", className)} style={style as any}>
      {children}
    </View>
  );
}

interface CardFooterProps {
  className?: string;
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
}

export function CardFooter({ className, style, children }: CardFooterProps) {
  return (
    <View
      className={cn("px-4 py-3 border-t flex-row items-center", className)}
      style={[
        {
          borderTopColor: "rgba(255,255,255,0.54)",
          backgroundColor: "rgba(255,255,255,0.3)",
        },
        style as any,
      ]}
    >
      {children}
    </View>
  );
}
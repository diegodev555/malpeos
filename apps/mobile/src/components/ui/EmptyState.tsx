import React from "react";
import { View, Text, ViewStyle } from "react-native";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "No data",
  message,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <View className={cn("flex-1 items-center justify-center py-12 px-6", className)}>
      {icon && <View className="mb-4 opacity-50">{icon}</View>}
      <Text className="text-lg font-medium text-foreground/60 mb-1">{title}</Text>
      {message && (
        <Text className="text-sm text-foreground/40 text-center mb-4">{message}</Text>
      )}
      {action && <View>{action}</View>}
    </View>
  );
}
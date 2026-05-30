import React from "react";
import { TextInput, View, Text, TextInputProps, ViewStyle } from "react-native";
import { cn } from "@/lib/cn";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

/**
 * Input component — matches the web app's glass-control input design
 * Ref: src/components/ui/input.tsx
 */
export function Input({
  label,
  error,
  containerClassName,
  className,
  style,
  ...props
}: InputProps) {
  return (
    <View className={cn("gap-1.5", containerClassName)}>
      {label && (
        <Text className="text-sm font-medium text-foreground/80">{label}</Text>
      )}
      <TextInput
        className={cn(
          "h-9 rounded-xl border px-3 py-1 text-base",
          "border-white/60 bg-white/40",
          "text-foreground",
          error ? "border-destructive" : "",
          className
        )}
        style={[
          {
            // Glass effect
            shadowColor: "rgba(13, 27, 68, 0.09)",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 1,
            shadowRadius: 2,
            elevation: 2,
          },
          style,
        ]}
        placeholderTextColor="oklch(0.48 0.048 235)"
        {...props}
      />
      {error && (
        <Text className="text-xs text-destructive">{error}</Text>
      )}
    </View>
  );
}
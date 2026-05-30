import React from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from "react-native";
import { theme } from "@/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

/**
 * AppInput — matches the web app's Input component
 * Ref: src/components/ui/input.tsx
 */
export function Input({
  label,
  error,
  containerStyle,
  style,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={theme.colors.mutedForeground}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.mutedForeground,
    marginBottom: 2,
  },
  input: {
    height: 44,
    paddingHorizontal: 12,
    fontSize: 15,
    color: theme.colors.foreground,
    backgroundColor: "rgba(255, 255, 255, 0.58)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.54)",
    borderRadius: 12,
  },
  inputError: {
    borderColor: theme.colors.destructive,
  },
  error: {
    fontSize: 12,
    color: theme.colors.destructive,
  },
});
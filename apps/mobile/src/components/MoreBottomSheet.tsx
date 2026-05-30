import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@/theme";
import { useRouter } from "expo-router";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

const MENU_ITEMS: MenuItem[] = [
  { label: "Accounts", icon: "📒", route: "/screens/accounts" },
  { label: "Trip Notes", icon: "📝", route: "/screens/trips/notes" },
  { label: "Fleet Details", icon: "ℹ️", route: "/screens/fleet/details" },
  { label: "Reports", icon: "📈", route: "/screens/reports" },
  { label: "Settings", icon: "⚙️", route: "/screens/settings" },
  { label: "Help & Support", icon: "❓", route: "/screens/help" },
];

interface MoreBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function MoreBottomSheet({ visible, onClose }: MoreBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleMenuPress = useCallback(
    (route: string) => {
      onClose();
      router.push(route as any);
    },
    [onClose, router]
  );

  if (!visible) return null;

  return (
    <Animated.View
      style={styles.backdrop}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
    >
      <Pressable style={styles.backdropTouch} onPress={onClose} />
      <Animated.View
        style={[
          styles.sheet,
          {
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
        entering={SlideInDown.springify().damping(20)}
        exiting={SlideOutDown.duration(150)}
      >
        <View style={styles.handle} />
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.route}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
              onPress={() => handleMenuPress(item.route)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: Platform.OS === "ios" ? 28 : 24,
    borderTopRightRadius: Platform.OS === "ios" ? 28 : 24,
    paddingTop: 12,
    maxHeight: "70%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: {
        elevation: 24,
      },
    }),
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  scrollView: {
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: Platform.OS === "ios" ? 16 : 12,
    marginVertical: 2,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  menuItemPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.06)",
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 14,
    width: 28,
    textAlign: "center",
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: Platform.OS === "ios" ? "500" : "500",
    color: theme.colors.foreground,
    flex: 1,
  },
});
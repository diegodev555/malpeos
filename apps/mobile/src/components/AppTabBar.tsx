import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@/theme";

const TABBAR_HEIGHT = 56;
const ICON_SIZE = 24;

const TAB_ICONS: Record<string, string> = {
  dashboard: "📊",
  trips: "🐟",
  fleet: "🚢",
  calendar: "📅",
  more: "⋯",
};

interface TabItem {
  name: string;
  label: string;
  icon: string;
}

const TABS: TabItem[] = [
  { name: "dashboard", label: "Dashboard", icon: TAB_ICONS.dashboard },
  { name: "trips", label: "Trips", icon: TAB_ICONS.trips },
  { name: "fleet", label: "Fleet", icon: TAB_ICONS.fleet },
  { name: "calendar", label: "Calendar", icon: TAB_ICONS.calendar },
  { name: "more", label: "More", icon: TAB_ICONS.more },
];

interface Route {
  name: string;
  key: string;
}

interface AppTabBarProps {
  state: { index: number; routes: Route[] };
  navigation: {
    navigate: (name: string) => void;
  };
  onMorePress: () => void;
}

export function AppTabBar({ state, navigation, onMorePress }: AppTabBarProps) {
  const insets = useSafeAreaInsets();
  const { index, routes } = state;

  const handleTabPress = (routeName: string) => {
    if (routeName === "more") {
      onMorePress();
      return;
    }
    navigation.navigate(routeName);
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          height: TABBAR_HEIGHT + Math.max(insets.bottom, 8),
        },
      ]}
    >
      <View style={styles.tabBar}>
        {routes.map((route) => {
          const tab = TABS.find((t) => t.name === route.name);
          if (!tab) return null;

          const isFocused = routes.indexOf(route) === index;
          const isMore = route.name === "more";

          return (
            <Pressable
              key={route.key}
              onPress={() => handleTabPress(route.name)}
              style={({ pressed }) => [
                styles.tabItem,
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={[styles.tabContent, isFocused && styles.focusedTab]}>
                <Text
                  style={[
                    styles.tabIcon,
                    { opacity: isFocused || isMore ? 1 : 0.5 },
                    isFocused && styles.focusedIcon,
                  ]}
                >
                  {tab.icon}
                </Text>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isFocused ? theme.colors.tabActive : theme.colors.tabInactive },
                    isFocused && styles.focusedLabel,
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: theme.colors.tabBackground,
    borderRadius: 24,
    marginHorizontal: 12,
    height: TABBAR_HEIGHT,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 20,
    minWidth: 56,
  },
  focusedTab: {
    backgroundColor: "rgba(11, 59, 99, 0.08)",
  },
  tabIcon: {
    fontSize: ICON_SIZE,
    marginBottom: 2,
    lineHeight: ICON_SIZE,
  },
  focusedIcon: {
    transform: [{ scale: 1.08 }],
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  focusedLabel: {
    fontWeight: "600",
  },
});
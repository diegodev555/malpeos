import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { theme } from "@/theme";
import { HapticTabButton } from "@/components/HapticTabButton";

const getTabBarIcon = (routeName: string, focused: boolean) => {
  const icons: Record<string, any> = {
    dashboard: require("../assets/dashboard.png"),
    trips: require("../assets/trips.png"),
    fleet: require("../assets/fleet.png"),
    calendar: require("../assets/calendar.png"),
  };
  return icons[routeName] || require("../assets/more.png");
};

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBackground,
          borderTopWidth: 0,
          elevation: Platform.OS === "android" ? 8 : 0,
          shadowColor: Platform.OS === "ios" ? "#000" : "transparent",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: Platform.OS === "ios" ? 0.12 : 0,
          shadowRadius: 8,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.tabActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: Platform.OS === "ios" ? "600" : "500",
          marginTop: Platform.OS === "ios" ? 4 : 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarShowLabel: true,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused }) => (
            <HapticTabButton
              icon={getTabBarIcon("dashboard", focused)}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: "Trips",
          tabBarIcon: ({ focused }) => (
            <HapticTabButton
              icon={getTabBarIcon("trips", focused)}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="fleet"
        options={{
          title: "Fleet",
          tabBarIcon: ({ focused }) => (
            <HapticTabButton
              icon={getTabBarIcon("fleet", focused)}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ focused }) => (
            <HapticTabButton
              icon={getTabBarIcon("calendar", focused)}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ focused }) => (
            <HapticTabButton
              icon={require("../../assets/more.png")}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
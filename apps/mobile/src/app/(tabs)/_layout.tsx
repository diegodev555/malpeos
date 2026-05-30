import React, { useState } from "react";
import { Tabs } from "expo-router";
import { AppTabBar } from "@/components/AppTabBar";
import MoreBottomSheet from "@/components/MoreBottomSheet";
import { theme } from "@/theme";

export default function TabLayout() {
  const [moreVisible, setMoreVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" },
          tabBarActiveTintColor: theme.colors.tabActive,
          tabBarInactiveTintColor: theme.colors.tabInactive,
        }}
        tabBar={(props) => (
          <AppTabBar {...props} onMorePress={() => setMoreVisible(true)} />
        )}
      >
        <Tabs.Screen
          name="dashboard"
          options={{ title: "Dashboard" }}
        />
        <Tabs.Screen
          name="trips"
          options={{ title: "Trips" }}
        />
        <Tabs.Screen
          name="fleet"
          options={{ title: "Fleet" }}
        />
        <Tabs.Screen
          name="calendar"
          options={{ title: "Calendar" }}
        />
        <Tabs.Screen
          name="more"
          options={{ title: "More", href: null }}
        />
      </Tabs>
      
      <MoreBottomSheet
        visible={moreVisible}
        onClose={() => setMoreVisible(false)}
      />
    </>
  );
}
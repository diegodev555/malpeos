import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, usePathname } from "expo-router";
import { useAppStore } from "@/store/useAppStore";

interface NavItem {
  href: string;
  label: string;
  icon: string; // emoji used as placeholder icon until we add lucide-react-native
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/trips", label: "Trips", icon: "🐟" },
  { href: "/boats", label: "Fleet Manager", icon: "🚢" },
  { href: "/accounts", label: "Accounts", icon: "📒" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
];

export function NavSidebar() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);

  if (!sidebarOpen) return null;

  const handleNav = (href: string) => {
    setSidebarOpen(false);
    router.push(href as any);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <View style={[styles.overlay]}>
      <TouchableOpacity
        style={styles.backdrop}
        onPress={() => setSidebarOpen(false)}
      />
      <View
        style={[
          styles.sidebar,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
          },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Text style={{ fontSize: 20 }}>⚓</Text>
          </View>
          <Text style={styles.logoText}>
            <Text style={{ color: "#0B3C64" }}>malpe</Text>
            <Text style={{ color: "#3CB4E5" }}>OS</Text>
          </Text>
        </View>

        {/* Nav Items */}
        <ScrollView style={styles.navList}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <TouchableOpacity
                key={item.href}
                style={[
                  styles.navItem,
                  active && styles.navItemActive,
                ]}
                onPress={() => handleNav(item.href)}
                activeOpacity={0.7}
              >
                <Text style={styles.navIcon}>{item.icon}</Text>
                <Text
                  style={[
                    styles.navLabel,
                    active && styles.navLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    flexDirection: "row",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  sidebar: {
    width: 272,
    backgroundColor: "rgba(255,255,255,0.54)",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.52)",
    paddingHorizontal: 20,
    backdropFilter: "blur(22px)",
    shadowColor: "rgba(13, 27, 68, 0.13)",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 1,
    shadowRadius: 50,
    elevation: 10,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  logoText: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  navList: {
    flex: 1,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: "oklch(0.46 0.145 223)",
    shadowColor: "oklch(0.46 0.145 223 / 0.18)",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 6,
  },
  navIcon: {
    fontSize: 16,
  },
  navLabel: {
    fontSize: 14.7,
    fontWeight: "600",
    color: "oklch(0.48 0.048 235)",
  },
  navLabelActive: {
    color: "#ffffff",
  },
});
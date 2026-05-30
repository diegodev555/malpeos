import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@/theme";
import { useRouter } from "expo-router";

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

interface MoreBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

const MENU_ITEMS: MenuItem[] = [
  { label: "Accounts", icon: "📒", route: "/screens/accounts" },
  { label: "Trip Notes", icon: "📝", route: "/screens/trips/notes" },
  { label: "Fleet Details", icon: "ℹ️", route: "/screens/fleet/details" },
  { label: "Reports", icon: "📈", route: "/screens/reports" },
  { label: "Settings", icon: "⚙️", route: "/screens/settings" },
  { label: "Help & Support", icon: "❓", route: "/screens/help" },
];

export default function MoreBottomSheet({ visible, onClose }: MoreBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleMenuPress = (route: string) => {
    onClose();
    router.push(route as any);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheetContainer}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
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
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    paddingBottom: 24,
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
    borderRadius: 16,
    marginVertical: 2,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  menuItemPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 14,
    width: 28,
    textAlign: "center",
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.foreground,
    flex: 1,
  },
});
import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { formatCurrency } from "@malpeos/shared";
import { Screen } from "@/components/ui/Screen";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { theme } from "@/theme";
import { useParties } from "@/hooks/useAccounts";
import { useRouter } from "expo-router";
import type { PartyWithBalance } from "@malpeos/shared";

export default function AccountsScreen() {
  const router = useRouter();
  const { data: parties, isLoading, error, refetch } = useParties();

  const formatCurrencyLocal = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Math.abs(value));

  const renderParty = ({ item }: { item: PartyWithBalance }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`../fleet/accounts/${item.id}`)}
    >
      <Card size="sm">
        <View style={styles.partyRow}>
          <View style={styles.partyInfo}>
            <View style={styles.partyHeader}>
              <Text style={styles.partyName}>{item.name}</Text>
              <Badge variant="outline">{item.type}</Badge>
            </View>
            {item.contact && (
              <Text style={styles.contactText}>{item.contact}</Text>
            )}
          </View>
          <View style={styles.balanceSection}>
            <Text
              style={[
                styles.balanceValue,
                { color: item.balance >= 0 ? theme.colors.success : theme.colors.destructive },
              ]}
            >
              {item.balance >= 0 ? "" : "-"}
              {formatCurrencyLocal(item.balance)}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <Screen onRefresh={refetch} refreshing={isLoading}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Accounts</Text>
          <Text style={styles.headerSubtitle}>
            Track transactions with vendors, crew, and suppliers
          </Text>
        </View>
      </View>

      {error ? (
        <EmptyState title="Failed to load accounts" message="Pull down to retry" />
      ) : parties && parties.length > 0 ? (
        <FlatList
          data={parties}
          renderItem={renderParty}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      ) : !isLoading ? (
        <EmptyState
          title="No accounts yet"
          message="Create your first vendor or crew account."
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: theme.colors.foreground,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  listContent: {
    gap: 4,
  },
  partyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  partyInfo: {
    flex: 1,
    gap: 4,
  },
  partyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  partyName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  contactText: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
  },
  balanceSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  balanceValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  chevron: {
    fontSize: 22,
    color: theme.colors.mutedForeground,
  },
});
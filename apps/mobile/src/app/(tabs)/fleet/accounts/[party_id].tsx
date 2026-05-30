import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { formatCurrency } from "@malpeos/shared";
import { Screen } from "@/components/ui/Screen";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { theme } from "@/theme";
import { usePartyLedger } from "@/hooks/useAccounts";
import type { LedgerEntryWithRelations } from "@malpeos/shared";

export default function AccountDetailScreen() {
  const { party_id } = useLocalSearchParams<{ party_id: string }>();
  const router = useRouter();
  const { data, isLoading, error, refetch } = usePartyLedger(party_id);

  const formatCurrencyLocal = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Math.abs(value));

  const balance = data?.entries.reduce((sum, entry) => {
    return entry.entry_type === "credit" ? sum + Number(entry.amount) : sum - Number(entry.amount);
  }, 0) || 0;

  const totalDebits = data?.entries
    .filter((e) => e.entry_type === "debit")
    .reduce((s, e) => s + Number(e.amount), 0) || 0;

  const totalCredits = data?.entries
    .filter((e) => e.entry_type === "credit")
    .reduce((s, e) => s + Number(e.amount), 0) || 0;

  if (isLoading && !data) return <Screen><Text style={styles.loadingText}>Loading...</Text></Screen>;
  if (error || !data) {
    return (
      <Screen>
        <EmptyState title="Account not found" actionLabel="Back" onAction={() => router.back()} />
      </Screen>
    );
  }

  const renderEntry = ({ item }: { item: LedgerEntryWithRelations }) => (
    <View style={styles.entryRow}>
      <View style={styles.entryLeft}>
        <Badge variant={item.entry_type === "debit" ? "destructive" : "default"}>
          {item.entry_type === "debit" ? "DR" : "CR"}
        </Badge>
        <View style={styles.entryInfo}>
          <Text style={styles.entryDate}>
            {new Date(item.entry_date).toLocaleDateString("en-IN")}
          </Text>
          {item.description && (
            <Text style={styles.entryDesc}>{item.description}</Text>
          )}
          {item.boats && (
            <Text style={styles.entryBoat}>{item.boats.name}</Text>
          )}
        </View>
      </View>
      <Text
        style={[
          styles.entryAmount,
          { color: item.entry_type === "debit" ? theme.colors.destructive : theme.colors.success },
        ]}
      >
        {item.entry_type === "debit" ? "-" : "+"}
        {formatCurrencyLocal(Number(item.amount))}
      </Text>
    </View>
  );

  return (
    <Screen onRefresh={refetch} refreshing={isLoading}>
      {/* Back */}
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Party Header */}
      <Card style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.heroHeader}>
            <Text style={styles.partyName}>{data.party.name}</Text>
            <Badge variant="outline">{data.party.type}</Badge>
          </View>
          {data.party.contact && (
            <Text style={styles.contactText}>{data.party.contact}</Text>
          )}
        </View>
      </Card>

      {/* Balance Cards */}
      <View style={styles.balanceGrid}>
        <Card size="sm" style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={[styles.balanceValue, { color: balance >= 0 ? theme.colors.success : theme.colors.destructive }]}>
            {balance >= 0 ? "" : "-"}
            {formatCurrencyLocal(balance)}
          </Text>
        </Card>
        <Card size="sm" style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Debits</Text>
          <Text style={[styles.balanceValue, { color: theme.colors.destructive }]}>
            {formatCurrencyLocal(totalDebits)}
          </Text>
        </Card>
        <Card size="sm" style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Credits</Text>
          <Text style={[styles.balanceValue, { color: theme.colors.success }]}>
            {formatCurrencyLocal(totalCredits)}
          </Text>
        </Card>
      </View>

      {/* Transactions */}
      {data.entries.length > 0 ? (
        <View>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <Card>
            <CardContent>
              <FlatList
                data={data.entries}
                renderItem={renderEntry}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </CardContent>
          </Card>
        </View>
      ) : (
        <EmptyState title="No transactions yet" message="Add your first transaction." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    textAlign: "center",
    color: theme.colors.mutedForeground,
    marginTop: 40,
  },
  backRow: {
    marginBottom: 12,
  },
  backButton: {
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  heroCard: {
    marginBottom: 12,
  },
  heroContent: {
    gap: 4,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  partyName: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  contactText: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
  },
  balanceGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  balanceCard: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: theme.colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 8,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  entryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  entryInfo: {
    gap: 2,
    flex: 1,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.foreground,
  },
  entryDesc: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
  },
  entryBoat: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: "500",
  },
  entryAmount: {
    fontSize: 15,
    fontWeight: "700",
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    opacity: 0.5,
  },
});
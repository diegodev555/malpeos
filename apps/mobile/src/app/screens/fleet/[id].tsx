import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { formatCurrency } from "@malpeos/shared";
import { Screen } from "@/components/ui/Screen";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { theme } from "@/theme";
import { useBoatDetail, useBoatTrips } from "@/hooks/useBoats";
import type { TripSummary } from "@malpeos/shared";

export default function BoatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: boat, isLoading: boatLoading, error: boatError } = useBoatDetail(id);
  const { data: trips, isLoading: tripsLoading } = useBoatTrips(id);

  const formatCurrencyLocal = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const totals = React.useMemo(() => {
    if (!trips) return { revenue: 0, expenses: 0, netProfit: 0, count: 0 };
    return {
      revenue: trips.reduce((s, t) => s + Number(t.gross_revenue), 0),
      expenses: trips.reduce((s, t) => s + Number(t.total_expense), 0),
      netProfit: trips.reduce((s, t) => s + Number(t.net_profit), 0),
      count: trips.length,
      active: trips.filter((t) => t.status === "active").length,
    };
  }, [trips]);

  if (boatLoading) return <Screen><Text style={styles.loadingText}>Loading...</Text></Screen>;
  if (boatError || !boat) {
    return (
      <Screen>
        <EmptyState title="Boat not found" actionLabel="Back to Fleet" onAction={() => router.back()} />
      </Screen>
    );
  }

  const renderTrip = ({ item }: { item: TripSummary }) => (
    <Card size="sm">
      <View style={styles.tripRow}>
        <View style={styles.tripInfo}>
          <View style={styles.tripHeader}>
            <Text style={styles.tripDate}>
              {new Date(item.start_date).toLocaleDateString("en-IN")}
              {item.end_date ? ` → ${new Date(item.end_date).toLocaleDateString("en-IN")}` : ""}
            </Text>
            <Badge variant={item.status === "active" ? "default" : "secondary"}>
              {item.status}
            </Badge>
          </View>
          <View style={styles.tripMetrics}>
            <Text style={styles.metric}>
              Rev: <Text style={styles.metricValue}>{formatCurrencyLocal(Number(item.gross_revenue))}</Text>
            </Text>
            <Text style={styles.metric}>
              Net:{" "}
              <Text style={[styles.metricValue, { color: Number(item.net_profit) >= 0 ? theme.colors.success : theme.colors.destructive }]}>
                {formatCurrencyLocal(Number(item.net_profit))}
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <Screen>
      {/* Back button & header */}
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Boat Hero */}
      <Card style={styles.heroCard}>
        <View style={styles.heroContent}>
          <Text style={styles.boatName}>{boat.name}</Text>
          <View style={styles.boatMeta}>
            <Badge variant="outline">{boat.registration}</Badge>
            {boat.engine_details && (
              <Text style={styles.engineText}>{boat.engine_details}</Text>
            )}
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.stat}>
              {totals.count} trips{", "}
              <Text style={styles.statHighlight}>{totals.active} active</Text>
            </Text>
          </View>
        </View>
      </Card>

      {/* Financial Stats */}
      <View style={styles.statsGrid}>
        <Card size="sm" style={styles.statCard}>
          <Text style={styles.statLabel}>Total Revenue</Text>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>
            {formatCurrencyLocal(totals.revenue)}
          </Text>
        </Card>
        <Card size="sm" style={styles.statCard}>
          <Text style={styles.statLabel}>Total Expenses</Text>
          <Text style={[styles.statValue, { color: theme.colors.destructive }]}>
            {formatCurrencyLocal(totals.expenses)}
          </Text>
        </Card>
        <Card size="sm" style={styles.statCard}>
          <Text style={styles.statLabel}>Net Profit</Text>
          <Text style={[styles.statValue, { color: totals.netProfit >= 0 ? theme.colors.success : theme.colors.destructive }]}>
            {formatCurrencyLocal(totals.netProfit)}
          </Text>
        </Card>
      </View>

      {/* Trips List */}
      {trips && trips.length > 0 ? (
        <View>
          <Text style={styles.sectionTitle}>Recent Trips</Text>
          <FlatList
            data={trips.slice(0, 10)}
            renderItem={renderTrip}
            keyExtractor={(item) => item.trip_id}
            scrollEnabled={false}
          />
        </View>
      ) : !tripsLoading ? (
        <EmptyState title="No trips yet" message="This boat hasn't been on any trips." />
      ) : null}
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
    gap: 8,
  },
  boatName: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.malpeosDark,
  },
  boatMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  engineText: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
  },
  statsRow: {
    marginTop: 4,
  },
  stat: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
  },
  statHighlight: {
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: theme.colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: theme.colors.malpeosDark,
    marginBottom: 8,
  },
  tripRow: {
    gap: 4,
  },
  tripInfo: {
    flex: 1,
  },
  tripHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tripDate: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  tripMetrics: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  metric: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
  },
  metricValue: {
    fontWeight: "600",
    color: theme.colors.foreground,
  },
});
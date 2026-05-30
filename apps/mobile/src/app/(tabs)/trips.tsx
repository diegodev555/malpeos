import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { formatCurrency, formatDate } from "@malpeos/shared";
import { Screen } from "@/components/ui/Screen";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { theme } from "@/theme";
import { useTrips, TripRow } from "@/hooks/useTrips";
import { useRouter } from "expo-router";

export default function TripsScreen() {
  const router = useRouter();
  const { data: trips, isLoading, error, refetch } = useTrips();

  const formatCurrencyLocal = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const renderTrip = ({ item }: { item: TripRow }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/screens/fleet/${item.boat_id}` as any)}
    >
      <Card size="sm">
        <View style={styles.tripRow}>
          <View style={styles.tripInfo}>
            <View style={styles.tripHeader}>
              <Text style={styles.boatName}>{item.boat_name}</Text>
              <Badge variant={item.status === "active" ? "default" : "secondary"}>
                {item.status}
              </Badge>
            </View>
            <View style={styles.tripDates}>
              <Text style={styles.dateText}>
                {new Date(item.start_date).toLocaleDateString("en-IN")}
                {item.end_date
                  ? ` → ${new Date(item.end_date).toLocaleDateString("en-IN")}`
                  : ""}
              </Text>
            </View>
            <View style={styles.tripMetrics}>
              <Text style={styles.metric}>
                Revenue:{" "}
                <Text style={styles.metricValue}>
                  {formatCurrencyLocal(Number(item.gross_revenue))}
                </Text>
              </Text>
              <Text style={styles.metric}>
                Net:{" "}
                <Text
                  style={[
                    styles.metricValue,
                    {
                      color:
                        Number(item.net_profit) >= 0
                          ? theme.colors.success
                          : theme.colors.destructive,
                    },
                  ]}
                >
                  {formatCurrencyLocal(Number(item.net_profit))}
                </Text>
              </Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <Screen onRefresh={refetch} refreshing={isLoading}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Trips</Text>
          <Text style={styles.headerSubtitle}>All fishing trips</Text>
        </View>
<Button onPress={() => router.push("/screens/trips/new" as any)}>
           New Trip
         </Button>
      </View>

      {error ? (
        <EmptyState
          title="Failed to load trips"
          message="Pull down to retry"
        />
      ) : trips && trips.length > 0 ? (
        <FlatList
          data={trips}
          renderItem={renderTrip}
          keyExtractor={(item) => item.trip_id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      ) : !isLoading ? (
        <EmptyState
          title="No trips yet"
          message="Create your first trip to get started."
          actionLabel="New Trip"
          onAction={() => router.push("/screens/trips/new" as any)}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: theme.colors.malpeosDark,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  listContent: {
    gap: 4,
  },
  tripRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tripInfo: {
    flex: 1,
    gap: 4,
  },
  tripHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  boatName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  tripDates: {
    marginTop: 2,
  },
  dateText: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
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
  chevron: {
    fontSize: 22,
    color: theme.colors.mutedForeground,
  },
});
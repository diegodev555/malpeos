import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { getSupabaseClient, formatCurrency, getErrorMessage } from "@malpeos/shared";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";

interface TripRow {
  trip_id: string;
  boat_id: string;
  boat_name: string;
  start_date: string;
  end_date: string | null;
  status: string;
  gross_revenue: number;
  total_expense: number;
  net_profit: number;
}

export default function TripsScreen() {
  const insets = useSafeAreaInsets();
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchTrips() {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("trip_summary")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTrips();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTrips();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <Text style={{ fontSize: 20 }}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Trips</Text>
          <Text style={styles.headerSubtitle}>All fishing trips</Text>
        </View>
        <Button size="sm" onPress={() => router.push("/" as any)}>
          + New Trip
        </Button>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Trip History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <View style={styles.center}>
                <Text style={styles.placeholderText}>Loading...</Text>
              </View>
            ) : trips.length === 0 ? (
              <View style={styles.center}>
                <Text style={styles.placeholderText}>
                  No trips yet. Create your first trip to get started.
                </Text>
              </View>
            ) : (
              <View style={styles.tripList}>
                {trips.map((trip) => {
                  const startDate = new Date(trip.start_date).toLocaleDateString("en-IN");
                  const endDate = trip.end_date
                    ? new Date(trip.end_date).toLocaleDateString("en-IN")
                    : "—";
                  const isProfitable = Number(trip.net_profit) >= 0;

                  return (
                    <TouchableOpacity
                      key={trip.trip_id}
                      style={styles.tripRow}
                      activeOpacity={0.7}
                    >
                      <View style={styles.tripRowHeader}>
                        <Text style={styles.tripBoatName}>{trip.boat_name}</Text>
                        <Badge variant={trip.status === "active" ? "default" : "secondary"}>
                          {trip.status}
                        </Badge>
                      </View>
                      <View style={styles.tripRowDates}>
                        <Text style={styles.tripDate}>{startDate}</Text>
                        <Text style={styles.tripDateSep}>→</Text>
                        <Text style={styles.tripDate}>{endDate}</Text>
                      </View>
                      <View style={styles.tripRowFinances}>
                        <View>
                          <Text style={styles.financeLabel}>Revenue</Text>
                          <Text style={styles.financeValue}>
                            {formatCurrency(Number(trip.gross_revenue))}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.financeLabel}>Expenses</Text>
                          <Text style={styles.financeValue}>
                            {formatCurrency(Number(trip.total_expense))}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.financeLabel}>Profit</Text>
                          <Text
                            style={[
                              styles.financeValue,
                              { color: isProfitable ? "#16A34A" : "#DC2626" },
                            ]}
                          >
                            {formatCurrency(Number(trip.net_profit))}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.54)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.52)",
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 24, fontWeight: "600", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: "oklch(0.48 0.048 235)", marginTop: 2 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  center: { padding: 32, alignItems: "center" },
  placeholderText: { color: "oklch(0.48 0.048 235)", fontSize: 14, textAlign: "center" },
  tripList: { gap: 8 },
  tripRow: {
    backgroundColor: "rgba(255,255,255,0.45)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    padding: 12,
    gap: 8,
  },
  tripRowHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tripBoatName: { fontSize: 15, fontWeight: "600" },
  tripRowDates: { flexDirection: "row", gap: 8, alignItems: "center" },
  tripDate: { fontSize: 13, color: "oklch(0.48 0.048 235)" },
  tripDateSep: { fontSize: 13, color: "oklch(0.48 0.048 235 / 0.5)" },
  tripRowFinances: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.4)",
  },
  financeLabel: { fontSize: 11, color: "oklch(0.48 0.048 235)", marginBottom: 2 },
  financeValue: { fontSize: 14, fontWeight: "600" },
});
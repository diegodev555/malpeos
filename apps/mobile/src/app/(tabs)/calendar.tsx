import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { getSupabaseClient } from "@malpeos/shared";
import { Screen } from "@/components/ui/Screen";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { theme } from "@/theme";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

interface CalendarItem {
  id: string;
  boat_name: string;
  start_date: string;
  end_date: string | null;
  status: string;
}

async function fetchTripsForCalendar(): Promise<CalendarItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("trips")
    .select("id, boat_id, start_date, end_date, status, boats(name)")
    .order("start_date", { ascending: true });

  if (error) throw error;

  return ((data || []) as any[]).map((trip: any) => {
    const boatData = trip.boats ?? [];
    const boatName = Array.isArray(boatData) ? boatData[0]?.name ?? "Unknown" : "Unknown";
    return {
      id: trip.id,
      boat_name: boatName,
      start_date: trip.start_date,
      end_date: trip.end_date,
      status: trip.status,
    };
  });
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function CalendarScreen() {
  const router = useRouter();
  const { data: trips, isLoading, error, refetch } = useQuery({
    queryKey: ["calendar-trips"],
    queryFn: fetchTripsForCalendar,
    staleTime: 1000 * 60 * 2,
  });

  // Group trips by month
  const groupedTrips = React.useMemo(() => {
    if (!trips) return [];
    const groups = new Map<string, CalendarItem[]>();
    trips.forEach((trip) => {
      const d = new Date(trip.start_date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleString("default", { month: "long", year: "numeric" });
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(trip);
    });
    return Array.from(groups.entries()).map(([key, items]) => ({
      key,
      label: items.length > 0
        ? new Date(items[0].start_date).toLocaleString("default", { month: "long", year: "numeric" })
        : key,
      items,
    }));
  }, [trips]);

  const renderTrip = (trip: CalendarItem) => (
    <TouchableOpacity
      key={trip.id}
      activeOpacity={0.7}
    >
      <View style={styles.tripItem}>
        <View style={styles.tripDot} />
        <View style={styles.tripItemInfo}>
          <Text style={styles.tripBoatName}>{trip.boat_name}</Text>
          <Text style={styles.tripDate}>
            {formatDate(trip.start_date)}
            {trip.end_date ? ` → ${formatDate(trip.end_date)}` : ""}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: trip.status === "active" ? theme.colors.success : theme.colors.muted },
          ]}
        >
          <Text style={[styles.statusText, { color: trip.status === "active" ? "#FFF" : theme.colors.mutedForeground }]}>
            {trip.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen onRefresh={refetch} refreshing={isLoading}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <Text style={styles.headerSubtitle}>Fleet trip schedule</Text>
      </View>

      {error ? (
        <EmptyState title="Failed to load calendar" message="Pull down to retry" />
      ) : groupedTrips.length > 0 ? (
        groupedTrips.map((group) => (
          <View key={group.key} style={styles.monthGroup}>
            <Text style={styles.monthLabel}>{group.label}</Text>
            <Card>
              <CardContent>
                <View style={styles.tripList}>
                  {group.items.map(renderTrip)}
                </View>
              </CardContent>
            </Card>
          </View>
        ))
      ) : !isLoading ? (
        <EmptyState
          title="No trips scheduled"
          message="Create a trip to see it on the calendar."
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
    color: theme.colors.malpeosDark,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  monthGroup: {
    marginBottom: 16,
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 8,
  },
  tripList: {
    gap: 12,
  },
  tripItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tripDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  tripItemInfo: {
    flex: 1,
  },
  tripBoatName: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  tripDate: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
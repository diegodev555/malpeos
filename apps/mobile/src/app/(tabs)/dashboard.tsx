import React, { useCallback } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { formatCurrency, getErrorMessage, getSupabaseClient } from "@malpeos/shared";
import { Screen } from "@/components/ui/Screen";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { KpiCard } from "@/components/ui/KpiCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { theme } from "@/theme";
import { useQuery } from "@tanstack/react-query";

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
}

interface CategoryExpense {
  name: string;
  value: number;
  color: string;
}

interface DashboardTotals {
  ytdRevenue: number;
  ytdExpenses: number;
  ytdNetProfit: number;
  ytdGstPaid: number;
  activeTrips: number;
}

const CATEGORY_COLORS: Record<string, string> = theme.colors.categoryColors;

async function fetchDashboardData() {
  const supabase = getSupabaseClient();

  const { data: tripSummaries, error: tripsError } = await supabase
    .from("trip_summary")
    .select("*");

  if (tripsError) throw tripsError;
  const summaries = tripSummaries || [];

  const currentYear = new Date().getFullYear();
  const ytdTrips = summaries.filter(
    (t: any) => new Date(t.start_date).getFullYear() === currentYear
  );

  const ytdRevenue = ytdTrips.reduce((sum: number, t: any) => sum + Number(t.gross_revenue), 0);
  const ytdExpenses = ytdTrips.reduce((sum: number, t: any) => sum + Number(t.total_expense), 0);
  const ytdNetProfit = ytdTrips.reduce((sum: number, t: any) => sum + Number(t.net_profit), 0);
  const ytdGstPaid = ytdTrips.reduce((sum: number, t: any) => sum + Number(t.total_gst_paid), 0);

  // Monthly aggregation
  const monthMap = new Map<string, { revenue: number; expenses: number }>();
  ytdTrips.forEach((t: any) => {
    const d = new Date(t.start_date);
    const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
    if (!monthMap.has(label)) {
      monthMap.set(label, { revenue: 0, expenses: 0 });
    }
    const entry = monthMap.get(label)!;
    entry.revenue += Number(t.gross_revenue);
    entry.expenses += Number(t.total_expense);
  });

  const monthlyData: MonthlyData[] = Array.from(monthMap.entries()).map(
    ([month, vals]) => ({
      month,
      revenue: Math.round(vals.revenue * 100) / 100,
      expenses: Math.round(vals.expenses * 100) / 100,
    })
  );

  // Category breakdown
  const ytdTripIds = ytdTrips.map((t: any) => t.trip_id);
  let categoryData: CategoryExpense[] = [];

  if (ytdTripIds.length > 0) {
    const { data: expenseData } = await supabase
      .from("expenses")
      .select("category, base_amount, gst_amount")
      .in("trip_id", ytdTripIds);

    const categoryTotals = new Map<string, number>();
    (expenseData || []).forEach((e: any) => {
      const total = Number(e.base_amount) + Number(e.gst_amount);
      const current = categoryTotals.get(e.category) || 0;
      categoryTotals.set(e.category, current + total);
    });

    categoryData = Array.from(categoryTotals.entries())
      .map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100,
        color: CATEGORY_COLORS[name] || "#6b7280",
      }))
      .sort((a, b) => b.value - a.value);
  }

  const { count } = await supabase
    .from("trips")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  return {
    monthlyData,
    categoryData,
    totals: {
      ytdRevenue,
      ytdExpenses,
      ytdNetProfit,
      ytdGstPaid,
      activeTrips: count || 0,
    },
  };
}

export default function DashboardScreen() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60 * 2,
  });

  if (error) {
    return (
      <Screen>
        <EmptyState
          title="Unable to load dashboard"
          message={getErrorMessage(error)}
        />
      </Screen>
    );
  }

  const totals = data?.totals;
  const monthlyData = data?.monthlyData || [];
  const categoryData = data?.categoryData || [];
  const maxVal = Math.max(...monthlyData.flatMap((d) => [d.revenue, d.expenses]), 1);

  return (
    <Screen onRefresh={refetch} refreshing={isLoading}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Year-to-date financial overview</Text>
        </View>
        {totals && (
          <Badge variant={totals.ytdNetProfit >= 0 ? "default" : "destructive"}>
            {totals.activeTrips} Active Trip{totals.activeTrips !== 1 ? "s" : ""}
          </Badge>
        )}
      </View>

      {/* KPI Cards */}
      {totals && (
        <View style={styles.kpiGrid}>
          <KpiCard
            title="Net Profit (YTD)"
            value={formatCurrency(totals.ytdNetProfit)}
            subtitle={totals.ytdNetProfit >= 0 ? "Profitable year so far" : "Loss year so far"}
            positive={totals.ytdNetProfit >= 0}
          />
          <KpiCard
            title="Gross Revenue (YTD)"
            value={formatCurrency(totals.ytdRevenue)}
            subtitle="Total fish sales (GST-exempt)"
            color="#3B82F6"
          />
          <KpiCard
            title="Eligible ITC (YTD)"
            value={formatCurrency(totals.ytdGstPaid)}
            subtitle="Total GST paid — Input Tax Credit"
            color="#A855F7"
          />
          <KpiCard
            title="Total Expenses (YTD)"
            value={formatCurrency(totals.ytdExpenses)}
            subtitle="Including GST component"
            color="#F97316"
          />
        </View>
      )}

      {/* Monthly Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length === 0 ? (
            <View style={styles.chartPlaceholder}>
              <Text style={styles.placeholderText}>
                {isLoading ? "Loading..." : "No trip data for this year yet."}
              </Text>
            </View>
          ) : (
            <View style={styles.barChart}>
              {monthlyData.map((item) => {
                const revHeight = (item.revenue / maxVal) * 160;
                const expHeight = (item.expenses / maxVal) * 160;
                return (
                  <View key={item.month} style={styles.barColumn}>
                    <View style={styles.barGroup}>
                      <View style={[styles.bar, { height: Math.max(revHeight, 4), backgroundColor: theme.colors.chart1, borderTopLeftRadius: 4, borderTopRightRadius: 4 }]} />
                      <View style={[styles.bar, { height: Math.max(expHeight, 4), backgroundColor: theme.colors.chart2, borderTopLeftRadius: 4, borderTopRightRadius: 4 }]} />
                    </View>
                    <Text style={styles.barLabel}>{item.month}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <View style={styles.chartPlaceholder}>
              <Text style={styles.placeholderText}>
                {isLoading ? "Loading..." : "No expense data yet."}
              </Text>
            </View>
          ) : (
            <View style={styles.categoryList}>
              {categoryData.map((item) => {
                const pct = (item.value / (totals?.ytdExpenses || 1)) * 100;
                return (
                  <View key={item.name} style={styles.categoryRow}>
                    <View style={styles.categoryHeader}>
                      <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                      <Text style={styles.categoryName}>{item.name}</Text>
                      <Text style={styles.categoryValue}>{formatCurrency(item.value)}</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${Math.max(pct, 2)}%`, backgroundColor: item.color }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </CardContent>
      </Card>
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
  kpiGrid: {
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: theme.colors.mutedForeground,
    fontSize: 13,
    textAlign: "center",
  },
  barChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 220,
    paddingTop: 16,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 2,
  },
  barGroup: {
    flexDirection: "row",
    gap: 2,
    alignItems: "flex-end",
    height: 180,
  },
  bar: {
    width: 10,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: theme.colors.mutedForeground,
    marginTop: 6,
  },
  categoryList: {
    gap: 12,
  },
  categoryRow: {
    gap: 6,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.foreground,
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
});
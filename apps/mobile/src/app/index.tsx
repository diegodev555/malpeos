import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getSupabaseClient } from "@malpeos/shared";
import { formatCurrency, getErrorMessage } from "@malpeos/shared";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { NavSidebar } from "@/components/NavSidebar";
import { useAppStore } from "@/store/useAppStore";

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

const CATEGORY_COLORS: Record<string, string> = {
  Fuel: "#f97316",
  Maintenance: "#a855f7",
  "Port Fees": "#0ea5e9",
  Wages: "#10b981",
  Ice: "#06b6d4",
  Other: "#6b7280",
};

/**
 * Dashboard screen — matches the web app's DashboardPage
 * Ref: src/app/page.tsx
 */
export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryExpense[]>([]);
  const [totals, setTotals] = useState<DashboardTotals>({
    ytdRevenue: 0,
    ytdExpenses: 0,
    ytdNetProfit: 0,
    ytdGstPaid: 0,
    activeTrips: 0,
  });

  async function fetchDashboardData() {
    try {
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

      const ytdRevenue = ytdTrips.reduce(
        (sum: number, t: any) => sum + Number(t.gross_revenue), 0
      );
      const ytdExpenses = ytdTrips.reduce(
        (sum: number, t: any) => sum + Number(t.total_expense), 0
      );
      const ytdNetProfit = ytdTrips.reduce(
        (sum: number, t: any) => sum + Number(t.net_profit), 0
      );
      const ytdGstPaid = ytdTrips.reduce(
        (sum: number, t: any) => sum + Number(t.total_gst_paid), 0
      );

      // Monthly aggregation
      const monthMap = new Map<string, { revenue: number; expenses: number }>();
      ytdTrips.forEach((t: any) => {
        const d = new Date(t.start_date);
        const label = d.toLocaleString("default", {
          month: "short",
          year: "2-digit",
        });
        if (!monthMap.has(label)) {
          monthMap.set(label, { revenue: 0, expenses: 0 });
        }
        const entry = monthMap.get(label)!;
        entry.revenue += Number(t.gross_revenue);
        entry.expenses += Number(t.total_expense);
      });

      const chartData: MonthlyData[] = Array.from(monthMap.entries()).map(
        ([month, vals]) => ({
          month,
          revenue: Math.round(vals.revenue * 100) / 100,
          expenses: Math.round(vals.expenses * 100) / 100,
        })
      );

      // Category breakdown
      const ytdTripIds = ytdTrips.map((t: any) => t.trip_id);
      if (ytdTripIds.length > 0) {
        const { data: expenseData, error: expenseError } = await supabase
          .from("expenses")
          .select("category, base_amount, gst_amount")
          .in("trip_id", ytdTripIds);

        if (expenseError) throw expenseError;

        const categoryTotals = new Map<string, number>();
        (expenseData || []).forEach((e: any) => {
          const total = Number(e.base_amount) + Number(e.gst_amount);
          const current = categoryTotals.get(e.category) || 0;
          categoryTotals.set(e.category, current + total);
        });

        const pieData: CategoryExpense[] = Array.from(categoryTotals.entries())
          .map(([name, value]) => ({
            name,
            value: Math.round(value * 100) / 100,
            color: CATEGORY_COLORS[name] || "#6b7280",
          }))
          .sort((a, b) => b.value - a.value);

        setCategoryData(pieData);
      }

      const { count, error: countError } = await supabase
        .from("trips")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      if (countError) throw countError;

      setMonthlyData(chartData);
      setTotals({
        ytdRevenue,
        ytdExpenses,
        ytdNetProfit,
        ytdGstPaid,
        activeTrips: count || 0,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const totalExpenses = totals.ytdExpenses;
  const totalRevenue = totals.ytdRevenue;

  // Calculate max value for bar chart
  const maxVal = Math.max(
    ...monthlyData.flatMap((d) => [d.revenue, d.expenses]),
    1
  );

  if (error) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <EmptyState
          title="Unable to load dashboard"
          message={error}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Year-to-date financial overview</Text>
        </View>
        <Badge variant={totals.ytdNetProfit >= 0 ? "default" : "destructive"}>
          {totals.activeTrips} Active Trip{totals.activeTrips !== 1 ? "s" : ""}
        </Badge>
      </View>

      <NavSidebar />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* KPI Cards */}
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

        {/* Monthly Chart */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Monthly Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <View style={styles.chartPlaceholder}>
                <Text style={styles.placeholderText}>
                  {loading
                    ? "Loading..."
                    : "No trip data for this year yet. Create a trip to see the chart."}
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
                        <View
                          style={[
                            styles.bar,
                            {
                              height: Math.max(revHeight, 4),
                              backgroundColor: "oklch(0.64 0.16 174)",
                              borderTopLeftRadius: 4,
                              borderTopRightRadius: 4,
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.bar,
                            {
                              height: Math.max(expHeight, 4),
                              backgroundColor: "oklch(0.69 0.18 55)",
                              borderTopLeftRadius: 4,
                              borderTopRightRadius: 4,
                            },
                          ]}
                        />
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
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <View style={styles.chartPlaceholder}>
                <Text style={styles.placeholderText}>
                  {loading
                    ? "Loading..."
                    : "No expense data yet."}
                </Text>
              </View>
            ) : (
              <View style={styles.categoryList}>
                {categoryData.map((item) => {
                  const pct = (item.value / totalExpenses) * 100;
                  return (
                    <View key={item.name} style={styles.categoryRow}>
                      <View style={styles.categoryHeader}>
                        <View
                          style={[
                            styles.categoryDot,
                            { backgroundColor: item.color },
                          ]}
                        />
                        <Text style={styles.categoryName}>{item.name}</Text>
                        <Text style={styles.categoryValue}>
                          {formatCurrency(item.value)}
                        </Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.max(pct, 2)}%`,
                              backgroundColor: item.color,
                            },
                          ]}
                        />
                      </View>
                    </View>
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

function KpiCard({
  title,
  value,
  subtitle,
  positive,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  positive?: boolean;
  color?: string;
}) {
  return (
    <Card size="sm" className="mb-3">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Text
          style={[
            styles.kpiValue,
            positive !== undefined && {
              color: positive ? "#16A34A" : "#DC2626",
            },
            color && { color },
          ]}
        >
          {value}
        </Text>
        <Text style={styles.kpiSubtitle}>{subtitle}</Text>
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.54)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.52)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "oklch(0.48 0.048 235)",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  kpiGrid: {
    marginBottom: 16,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  kpiSubtitle: {
    fontSize: 12,
    color: "oklch(0.48 0.048 235)",
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "oklch(0.48 0.048 235)",
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
    color: "oklch(0.48 0.048 235)",
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
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: "600",
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
"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, DollarSign, Receipt, PieChartIcon } from "lucide-react";

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

const CATEGORY_COLORS: Record<string, string> = {
  Fuel: "#f97316",
  Maintenance: "#a855f7",
  "Port Fees": "#0ea5e9",
  Wages: "#10b981",
  Ice: "#06b6d4",
  Other: "#6b7280",
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryExpense[]>([]);
  const [totals, setTotals] = useState({
    ytdRevenue: 0,
    ytdExpenses: 0,
    ytdNetProfit: 0,
    ytdGstPaid: 0,
    activeTrips: 0,
  });

  async function fetchDashboardData() {
    try {
      setLoading(true);

      const supabase = getSupabaseClient();

      // Get all trips with their summaries
      const { data: tripSummaries, error: tripsError } = await supabase
        .from("trip_summary")
        .select("*");

      if (tripsError) throw tripsError;

      const summaries = tripSummaries || [];

      // Calculate YTD totals
      const currentYear = new Date().getFullYear();
      const ytdTrips = summaries.filter(
        (t) => new Date(t.start_date).getFullYear() === currentYear
      );

      const ytdRevenue = ytdTrips.reduce(
        (sum, t) => sum + Number(t.gross_revenue),
        0
      );
      const ytdExpenses = ytdTrips.reduce(
        (sum, t) => sum + Number(t.total_expense),
        0
      );
      const ytdNetProfit = ytdTrips.reduce(
        (sum, t) => sum + Number(t.net_profit),
        0
      );
      const ytdGstPaid = ytdTrips.reduce(
        (sum, t) => sum + Number(t.total_gst_paid),
        0
      );

      // Aggregate monthly data for chart
      const monthMap = new Map<string, { revenue: number; expenses: number }>();

      ytdTrips.forEach((t) => {
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

      // Fetch expense breakdown by category for YTD
      // Get trip IDs for YTD trips
      const ytdTripIds = ytdTrips.map((t) => t.trip_id);

      if (ytdTripIds.length > 0) {
        const { data: expenseData, error: expenseError } = await supabase
          .from("expenses")
          .select("category, base_amount, gst_amount")
          .in("trip_id", ytdTripIds);

        if (!expenseError && expenseData) {
          const categoryTotals = new Map<string, number>();
          expenseData.forEach((e) => {
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
      }

      // Count active trips
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
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchDashboardData();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-destructive text-lg font-medium mb-2">
          Unable to load dashboard
        </div>
        <p className="text-muted-foreground text-sm mb-4">{error}</p>
        <p className="text-muted-foreground text-xs">
          Make sure your Supabase environment variables are set and the database
          has been initialized.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted-foreground">
            Year-to-date financial overview
          </p>
        </div>
        <Badge variant={totals.ytdNetProfit >= 0 ? "default" : "destructive"}>
          {totals.activeTrips} Active Trip{totals.activeTrips !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Profit (YTD)</CardTitle>
            <TrendingUp
              className={`h-4 w-4 ${totals.ytdNetProfit >= 0 ? "text-green-500" : "text-red-500"}`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-[1.7rem] font-semibold tracking-normal">
              {formatCurrency(totals.ytdNetProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totals.ytdNetProfit >= 0 ? "Profitable" : "Loss"} year so far
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gross Revenue (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-[1.7rem] font-semibold tracking-normal">
              {formatCurrency(totals.ytdRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total fish sales (GST-exempt)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Eligible ITC (YTD)
            </CardTitle>
            <Receipt className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-[1.7rem] font-semibold tracking-normal">
              {formatCurrency(totals.ytdGstPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total GST paid — Input Tax Credit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses (YTD)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-[1.7rem] font-semibold tracking-normal">
              {formatCurrency(totals.ytdExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Including GST component
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue vs Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                {loading ? "Loading..." : "No trip data for this year yet. Create a trip to see the chart."}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    className="text-xs text-muted-foreground"
                  />
                  <YAxis className="text-xs text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0 / 0.76)",
                      border: "1px solid oklch(1 0 0 / 0.62)",
                      borderRadius: "var(--radius-lg)",
                      backdropFilter: "blur(18px)",
                    }}
                    formatter={(value) => [formatCurrency(Number(value)), ""]}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                    name="Revenue"
                  />
                  <Bar
                    dataKey="expenses"
                    fill="var(--chart-2)"
                    radius={[4, 4, 0, 0]}
                    name="Expenses"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Expenses by Category Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
              Expenses by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                {loading
                  ? "Loading..."
                  : "No expense data yet. Create a trip with expenses to see the breakdown."}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={undefined}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0 / 0.76)",
                      border: "1px solid oklch(1 0 0 / 0.62)",
                      borderRadius: "var(--radius-lg)",
                      backdropFilter: "blur(18px)",
                    }}
                    formatter={(value) => [formatCurrency(Number(value)), ""]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

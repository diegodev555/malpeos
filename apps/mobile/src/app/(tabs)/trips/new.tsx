import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { getSupabaseClient } from "@malpeos/shared";
import { Screen } from "@/components/ui/Screen";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { theme } from "@/theme";
import { useQueryClient } from "@tanstack/react-query";
import type { Boat } from "@malpeos/shared";

interface CatchLogEntry {
  id: string;
  species: string;
  weight_kg: string;
  price_per_kg: string;
}

interface ExpenseEntry {
  id: string;
  category: string;
  base_amount: string;
  gst_amount: string;
  description: string;
}

const EXPENSE_CATEGORIES = ["Fuel", "Maintenance", "Port Fees", "Wages", "Ice", "Other"];

export default function NewTripScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  const [boats, setBoats] = useState<Boat[]>([]);
  const [saving, setSaving] = useState(false);
  const [boatId, setBoatId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"active" | "completed">("active");
  const [catchLogs, setCatchLogs] = useState<CatchLogEntry[]>([
    { id: Math.random().toString(36).slice(2), species: "", weight_kg: "", price_per_kg: "" },
  ]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([
    { id: Math.random().toString(36).slice(2), category: "Fuel", base_amount: "", gst_amount: "", description: "" },
  ]);

  useEffect(() => {
    supabase.from("boats").select("*").order("name").then(({ data }) => {
      if (data) setBoats(data as Boat[]);
    });
  }, []);

  const addCatchLog = () => {
    setCatchLogs([...catchLogs, { id: Math.random().toString(36).slice(2), species: "", weight_kg: "", price_per_kg: "" }]);
  };

  const removeCatchLog = (id: string) => {
    if (catchLogs.length <= 1) { Alert.alert("Validation", "At least one catch log is required"); return; }
    setCatchLogs(catchLogs.filter((c) => c.id !== id));
  };

  const updateCatchLog = (id: string, field: keyof CatchLogEntry, value: string) => {
    setCatchLogs(catchLogs.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const addExpense = () => {
    setExpenses([...expenses, { id: Math.random().toString(36).slice(2), category: "Fuel", base_amount: "", gst_amount: "", description: "" }]);
  };

  const removeExpense = (id: string) => {
    if (expenses.length <= 1) { Alert.alert("Validation", "At least one expense is required"); return; }
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const updateExpense = (id: string, field: keyof ExpenseEntry, value: string) => {
    setExpenses(expenses.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const totalRevenue = catchLogs.reduce((sum, c) => sum + (parseFloat(c.weight_kg) || 0) * (parseFloat(c.price_per_kg) || 0), 0);
  const totalBaseExpense = expenses.reduce((sum, e) => sum + (parseFloat(e.base_amount) || 0), 0);
  const totalGst = expenses.reduce((sum, e) => sum + (parseFloat(e.gst_amount) || 0), 0);
  const totalExpense = totalBaseExpense + totalGst;
  const netProfit = totalRevenue - totalExpense;

  const formatCurrencyLocal = (value: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

  const handleSubmit = async () => {
    if (!boatId) { Alert.alert("Validation", "Please select a boat"); return; }
    if (!startDate) { Alert.alert("Validation", "Please select a start date"); return; }

    const validCatchLogs = catchLogs.filter((c) => c.species && parseFloat(c.weight_kg) > 0 && parseFloat(c.price_per_kg) >= 0);
    if (validCatchLogs.length === 0) { Alert.alert("Validation", "Add at least one valid catch log"); return; }

    const validExpenses = expenses.filter((e) => parseFloat(e.base_amount) > 0);
    if (validExpenses.length === 0) { Alert.alert("Validation", "Add at least one expense with a base amount > 0"); return; }

    setSaving(true);
    try {
      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .insert({ boat_id: boatId, start_date: startDate, end_date: endDate || null, status })
        .select()
        .single();

      if (tripError) throw tripError;

      const { error: catchError } = await supabase.from("catch_logs").insert(
        validCatchLogs.map((c) => ({ trip_id: trip.id, species: c.species, weight_kg: parseFloat(c.weight_kg), price_per_kg: parseFloat(c.price_per_kg) }))
      );
      if (catchError) throw catchError;

      const { error: expenseError } = await supabase.from("expenses").insert(
        validExpenses.map((e) => ({ trip_id: trip.id, category: e.category, base_amount: parseFloat(e.base_amount), gst_amount: parseFloat(e.gst_amount) || 0, description: e.description || null }))
      );
      if (expenseError) throw expenseError;

      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      Alert.alert("Success", "Trip created!", [{ text: "OK", onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create trip");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backButton}>← Back to Trips</Text>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>New Trip</Text>
      <Text style={styles.pageSubtitle}>Log a fishing trip with catch and expense details</Text>

      {/* Trip Details */}
      <Card>
        <CardHeader><CardTitle>Trip Details</CardTitle></CardHeader>
        <CardContent>
          <View style={styles.formGrid}>
            <View>
              <Text style={styles.fieldLabel}>Boat *</Text>
              <View style={styles.boatPicker}>
                {boats.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.boatOption, boatId === b.id && styles.boatOptionSelected]}
                    onPress={() => setBoatId(b.id)}
                  >
                    <Text style={[styles.boatOptionText, boatId === b.id && styles.boatOptionTextSelected]}>
                      {b.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.statusRow}>
              {(["active", "completed"] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusOption, status === s && styles.statusOptionSelected]}
                  onPress={() => setStatus(s)}
                >
                  <Text style={[styles.statusOptionText, status === s && styles.statusOptionTextSelected]}>
                    {s === "active" ? "At Sea" : "Completed"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.dateRow}>
              <Input label="Start Date *" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" containerStyle={{ flex: 1 }} />
              <Input label="End Date" value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" containerStyle={{ flex: 1 }} />
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Catch Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Catch Logs</CardTitle>
          <Button variant="outline" size="sm" onPress={addCatchLog}>+ Add Catch</Button>
        </CardHeader>
        <CardContent>
          {catchLogs.map((catchLog, index) => (
            <View key={catchLog.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Badge variant="outline">#{index + 1}</Badge>
                <TouchableOpacity onPress={() => removeCatchLog(catchLog.id)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
              <Input label="Species" value={catchLog.species} onChangeText={(t) => updateCatchLog(catchLog.id, "species", t)} placeholder="e.g., Mackerel" />
              <View style={styles.entryRow}>
                <Input label="Weight (kg)" value={catchLog.weight_kg} onChangeText={(t) => updateCatchLog(catchLog.id, "weight_kg", t)} placeholder="0.0" keyboardType="decimal-pad" containerStyle={{ flex: 1 }} />
                <Input label="Rate (₹/kg)" value={catchLog.price_per_kg} onChangeText={(t) => updateCatchLog(catchLog.id, "price_per_kg", t)} placeholder="0" keyboardType="decimal-pad" containerStyle={{ flex: 1 }} />
              </View>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>
              Total Revenue:{" "}
              <Text style={{ color: theme.colors.success, fontWeight: "600" }}>{formatCurrencyLocal(totalRevenue)}</Text>
              {"  "}(GST-exempt)
            </Text>
          </View>
        </CardContent>
      </Card>

      {/* Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          <Button variant="outline" size="sm" onPress={addExpense}>+ Add Expense</Button>
        </CardHeader>
        <CardContent>
          {expenses.map((expense, index) => (
            <View key={expense.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Badge variant="outline">#{index + 1}</Badge>
                <TouchableOpacity onPress={() => removeExpense(expense.id)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.categoryRow}>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryOption, expense.category === cat && styles.categoryOptionSelected]}
                    onPress={() => updateExpense(expense.id, "category", cat)}
                  >
                    <Text style={[styles.categoryOptionText, expense.category === cat && styles.categoryOptionTextSelected]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Input label="Description" value={expense.description} onChangeText={(t) => updateExpense(expense.id, "description", t)} placeholder="Optional note" />
              <View style={styles.entryRow}>
                <Input label="Base Amount (₹)" value={expense.base_amount} onChangeText={(t) => updateExpense(expense.id, "base_amount", t)} placeholder="0" keyboardType="decimal-pad" containerStyle={{ flex: 1 }} />
                <Input label="GST (₹)" value={expense.gst_amount} onChangeText={(t) => updateExpense(expense.id, "gst_amount", t)} placeholder="0" keyboardType="decimal-pad" containerStyle={{ flex: 1 }} />
              </View>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>
              Base: {formatCurrencyLocal(totalBaseExpense)} | GST:{" "}
              <Text style={{ color: "#A855F7", fontWeight: "600" }}>{formatCurrencyLocal(totalGst)}</Text> | Total:{" "}
              <Text style={{ fontWeight: "600" }}>{formatCurrencyLocal(totalExpense)}</Text>
            </Text>
          </View>
        </CardContent>
      </Card>

      {/* Summary & Submit */}
      <Card>
        <CardHeader><CardTitle>Trip Summary</CardTitle></CardHeader>
        <CardContent>
          <View style={styles.summaryGrid}>
            <View>
              <Text style={styles.summaryLabel}>Revenue</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>{formatCurrencyLocal(totalRevenue)}</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.destructive }]}>{formatCurrencyLocal(totalExpense)}</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>GST (ITC)</Text>
              <Text style={[styles.summaryValue, { color: "#A855F7" }]}>{formatCurrencyLocal(totalGst)}</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Net Profit</Text>
              <Text style={[styles.summaryValue, { color: netProfit >= 0 ? theme.colors.success : theme.colors.destructive }]}>
                {formatCurrencyLocal(netProfit)}
              </Text>
            </View>
          </View>
          <View style={styles.submitRow}>
            <Button variant="outline" onPress={() => router.back()}>Cancel</Button>
            <Button onPress={handleSubmit} loading={saving} size="lg">
              {saving ? "Creating..." : "Create Trip"}
            </Button>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, paddingBottom: 40 },
  backButton: { fontSize: 15, color: theme.colors.primary, fontWeight: "600", marginBottom: 12 },
  pageTitle: { fontSize: 28, fontWeight: "700", letterSpacing: -0.5, color: theme.colors.malpeosDark },
  pageSubtitle: { fontSize: 13, color: theme.colors.mutedForeground, marginTop: 2, marginBottom: 16 },
  formGrid: { gap: 12 },
  fieldLabel: { fontSize: 12, fontWeight: "500", color: theme.colors.mutedForeground, marginBottom: 4 },
  boatPicker: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  boatOption: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.58)", borderWidth: 1, borderColor: "rgba(255,255,255,0.54)" },
  boatOptionSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  boatOptionText: { fontSize: 14, fontWeight: "500", color: theme.colors.foreground },
  boatOptionTextSelected: { color: theme.colors.primaryForeground },
  statusRow: { flexDirection: "row", gap: 8 },
  statusOption: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: "rgba(255,255,255,0.58)", borderWidth: 1, borderColor: "rgba(255,255,255,0.54)" },
  statusOptionSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  statusOptionText: { fontSize: 14, fontWeight: "600", color: theme.colors.foreground },
  statusOptionTextSelected: { color: theme.colors.primaryForeground },
  dateRow: { flexDirection: "row", gap: 8 },
  entryCard: { backgroundColor: "rgba(255,255,255,0.70)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.60)", padding: 12, marginBottom: 8 },
  entryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  removeText: { fontSize: 13, color: theme.colors.destructive, fontWeight: "500" },
  entryRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 8 },
  categoryOption: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.58)", borderWidth: 1, borderColor: "rgba(255,255,255,0.54)" },
  categoryOptionSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  categoryOptionText: { fontSize: 12, fontWeight: "500", color: theme.colors.foreground },
  categoryOptionTextSelected: { color: theme.colors.primaryForeground },
  totalRow: { marginTop: 8, alignItems: "flex-end" },
  totalText: { fontSize: 13, color: theme.colors.mutedForeground },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 16 },
  summaryLabel: { fontSize: 12, color: theme.colors.mutedForeground },
  summaryValue: { fontSize: 18, fontWeight: "700", marginTop: 2 },
  submitRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
});
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  PlusCircle,
  Trash2,
  ArrowLeft,
  Fish,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import type { Boat } from "@/types/database";

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

const EXPENSE_CATEGORIES = [
  "Fuel",
  "Maintenance",
  "Port Fees",
  "Wages",
  "Ice",
  "Other",
] as const;

const supabase = () => getSupabaseClient();

export default function NewTripPage() {
  const router = useRouter();
  const [boats, setBoats] = useState<Boat[]>([]);
  const [saving, setSaving] = useState(false);
  const [boatId, setBoatId] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"active" | "completed">("active");
  const [catchLogs, setCatchLogs] = useState<CatchLogEntry[]>([
    { id: crypto.randomUUID(), species: "", weight_kg: "", price_per_kg: "" },
  ]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([
    {
      id: crypto.randomUUID(),
      category: "Fuel",
      base_amount: "",
      gst_amount: "",
      description: "",
    },
  ]);

  async function loadBoats() {
    const { data } = await supabase().from("boats").select("*").order("name");
    if (data) setBoats(data);
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadBoats();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  function addCatchLog() {
    setCatchLogs([
      ...catchLogs,
      { id: crypto.randomUUID(), species: "", weight_kg: "", price_per_kg: "" },
    ]);
  }

  function removeCatchLog(id: string) {
    if (catchLogs.length <= 1) {
      toast.error("At least one catch log is required");
      return;
    }
    setCatchLogs(catchLogs.filter((c) => c.id !== id));
  }

  function updateCatchLog(id: string, field: keyof CatchLogEntry, value: string) {
    setCatchLogs(
      catchLogs.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }

  function addExpense() {
    setExpenses([
      ...expenses,
      {
        id: crypto.randomUUID(),
        category: "Fuel",
        base_amount: "",
        gst_amount: "",
        description: "",
      },
    ]);
  }

  function removeExpense(id: string) {
    if (expenses.length <= 1) {
      toast.error("At least one expense is required");
      return;
    }
    setExpenses(expenses.filter((e) => e.id !== id));
  }

  function updateExpense(id: string, field: keyof ExpenseEntry, value: string) {
    setExpenses(
      expenses.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  }

  const totalRevenue = catchLogs.reduce((sum, c) => {
    const weight = parseFloat(c.weight_kg) || 0;
    const price = parseFloat(c.price_per_kg) || 0;
    return sum + weight * price;
  }, 0);

  const totalBaseExpense = expenses.reduce(
    (sum, e) => sum + (parseFloat(e.base_amount) || 0),
    0
  );
  const totalGst = expenses.reduce(
    (sum, e) => sum + (parseFloat(e.gst_amount) || 0),
    0
  );
  const totalExpense = totalBaseExpense + totalGst;
  const netProfit = totalRevenue - totalExpense;

  async function handleSubmit() {
    if (!boatId) {
      toast.error("Please select a boat");
      return;
    }
    if (!startDate) {
      toast.error("Please select a start date");
      return;
    }

    const validCatchLogs = catchLogs.filter(
      (c) => c.species && parseFloat(c.weight_kg) > 0 && parseFloat(c.price_per_kg) >= 0
    );
    if (validCatchLogs.length === 0) {
      toast.error("Add at least one valid catch log (species, weight > 0, rate >= 0)");
      return;
    }

    const validExpenses = expenses.filter(
      (e) => parseFloat(e.base_amount) > 0
    );
    if (validExpenses.length === 0) {
      toast.error("Add at least one expense with a base amount > 0");
      return;
    }

    setSaving(true);
    try {
      const db = supabase();

      const { data: trip, error: tripError } = await db
        .from("trips")
        .insert({
          boat_id: boatId,
          start_date: startDate,
          end_date: endDate || null,
          status,
        })
        .select()
        .single();

      if (tripError) throw tripError;

      const { error: catchError } = await db.from("catch_logs").insert(
        validCatchLogs.map((c) => ({
          trip_id: trip.id,
          species: c.species,
          weight_kg: parseFloat(c.weight_kg),
          price_per_kg: parseFloat(c.price_per_kg),
        }))
      );
      if (catchError) throw catchError;

      const { error: expenseError } = await db.from("expenses").insert(
        validExpenses.map((e) => ({
          trip_id: trip.id,
          category: e.category,
          base_amount: parseFloat(e.base_amount),
          gst_amount: parseFloat(e.gst_amount) || 0,
          description: e.description || null,
        }))
      );
      if (expenseError) throw expenseError;

      toast.success("Trip created successfully!");
      router.push("/trips");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create trip"
      );
    } finally {
      setSaving(false);
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const selectedBoat = boats.find((b) => b.id === boatId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/trips">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1>New Trip</h1>
          <p className="text-muted-foreground">
            Log a fishing trip with catch and expense details
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="boat">Boat *</Label>
            <Select value={boatId} onValueChange={(val) => val && setBoatId(val)}>
              <SelectTrigger>
                {selectedBoat ? (
                  <span>
                    {selectedBoat.name} ({selectedBoat.registration})
                  </span>
                ) : (
                  <SelectValue placeholder="Select a boat" />
                )}
              </SelectTrigger>
              <SelectContent>
                {boats.map((boat) => (
                  <SelectItem key={boat.id} value={boat.id}>
                    {boat.name} ({boat.registration})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => v && setStatus(v as "active" | "completed")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active (At Sea)</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Fish className="h-5 w-5 text-blue-500" />
            Catch Logs
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addCatchLog}>
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Catch
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {catchLogs.map((catchLog, index) => (
            <div
              key={catchLog.id}
              className="glass-control flex flex-wrap items-end gap-3 rounded-2xl border border-white/60 p-3"
            >
              <span className="text-xs text-muted-foreground font-medium self-center mb-2">
                #{index + 1}
              </span>

              <div className="flex-1 min-w-[140px] space-y-1">
                <Label className="text-xs">Species</Label>
                <Input
                  placeholder="e.g., Mackerel"
                  value={catchLog.species}
                  onChange={(e) =>
                    updateCatchLog(catchLog.id, "species", e.target.value)
                  }
                />
              </div>

              <div className="w-[120px] space-y-1">
                <Label className="text-xs">Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={catchLog.weight_kg}
                  onChange={(e) =>
                    updateCatchLog(catchLog.id, "weight_kg", e.target.value)
                  }
                />
              </div>

              <div className="w-[130px] space-y-1">
                <Label className="text-xs">Rate (₹/kg)</Label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={catchLog.price_per_kg}
                  onChange={(e) =>
                    updateCatchLog(catchLog.id, "price_per_kg", e.target.value)
                  }
                />
              </div>

              <div className="text-right min-w-[100px] self-center mb-1">
                <div className="text-xs text-muted-foreground">Value</div>
                <div className="font-medium text-sm">
                  {formatCurrency(
                    (parseFloat(catchLog.weight_kg) || 0) *
                      (parseFloat(catchLog.price_per_kg) || 0)
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => removeCatchLog(catchLog.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {catchLogs.length > 0 && (
            <div className="flex justify-end pt-2 text-sm">
              <span className="font-medium">
                Total Revenue:{" "}
                <span className="text-green-600">
                  {formatCurrency(totalRevenue)}
                </span>
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                (GST-exempt — fresh fish)
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-orange-500" />
            Expenses
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addExpense}>
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Expense
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {expenses.map((expense, index) => (
            <div
              key={expense.id}
              className="glass-control flex flex-wrap items-end gap-3 rounded-2xl border border-white/60 p-3"
            >
              <span className="text-xs text-muted-foreground font-medium self-center mb-2">
                #{index + 1}
              </span>

              <div className="w-[140px] space-y-1">
                <Label className="text-xs">Category</Label>
                <Select
                  value={expense.category}
                  onValueChange={(v) =>
                    v && updateExpense(expense.id, "category", v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[140px] space-y-1">
                <Label className="text-xs">Description</Label>
                <Input
                  placeholder="Optional note"
                  value={expense.description}
                  onChange={(e) =>
                    updateExpense(expense.id, "description", e.target.value)
                  }
                />
              </div>

              <div className="w-[120px] space-y-1">
                <Label className="text-xs">Base Amount (₹)</Label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={expense.base_amount}
                  onChange={(e) =>
                    updateExpense(expense.id, "base_amount", e.target.value)
                  }
                />
              </div>

              <div className="w-[120px] space-y-1">
                <Label className="text-xs">GST (₹)</Label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={expense.gst_amount}
                  onChange={(e) =>
                    updateExpense(expense.id, "gst_amount", e.target.value)
                  }
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => removeExpense(expense.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {expenses.length > 0 && (
            <div className="flex justify-end pt-2 text-sm gap-4">
              <span>
                Base Total:{" "}
                <span className="font-medium">
                  {formatCurrency(totalBaseExpense)}
                </span>
              </span>
              <span>
                GST Paid:{" "}
                <span className="font-medium text-purple-600">
                  {formatCurrency(totalGst)}
                </span>
              </span>
              <span>
                Total:{" "}
                <span className="font-medium">
                  {formatCurrency(totalExpense)}
                </span>
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trip Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-sm text-muted-foreground">Gross Revenue</div>
              <div className="text-[1.35rem] font-semibold text-green-600">
                {formatCurrency(totalRevenue)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Expense</div>
              <div className="text-[1.35rem] font-semibold text-red-600">
                {formatCurrency(totalExpense)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">GST (ITC)</div>
              <div className="text-[1.35rem] font-semibold text-purple-600">
                {formatCurrency(totalGst)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Net Profit</div>
              <div
                className={`text-[1.35rem] font-semibold ${
                  netProfit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(netProfit)}
              </div>
            </div>
          </div>

          <Separator className="mb-6" />

          <div className="flex justify-end gap-3">
            <Link href="/trips">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={handleSubmit} disabled={saving} size="lg">
              {saving ? "Creating Trip..." : "Create Trip"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

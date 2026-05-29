"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusCircle, Pencil, Trash2, Ship, ExternalLink } from "lucide-react";
import type { Boat } from "@/types/database";

// Track per-boat maintenance dues from ledger_entries
interface BoatLedgerDues {
  boat_id: string;
  net_dues: number; // positive = we owe them (debits exceed credits)
}

export default function BoatsPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [boats, setBoats] = useState<Boat[]>([]);
  const [ledgerDues, setLedgerDues] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBoat, setEditingBoat] = useState<Boat | null>(null);
  const [form, setForm] = useState({ name: "", registration: "", engine_details: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBoatsAndDues();
  }, []);

  async function fetchBoatsAndDues() {
    try {
      // Fetch boats
      const { data, error } = await supabase
        .from("boats")
        .select("*")
        .order("name");

      if (error) throw error;
      setBoats(data || []);

      // Fetch ledger entries aggregated by boat_id to compute maintenance dues
      const { data: ledgerData, error: ledgerError } = await supabase
        .from("ledger_entries")
        .select("boat_id, entry_type, amount")
        .not("boat_id", "is", null);

      if (ledgerError) throw ledgerError;

      // Compute net dues per boat: debits (what we owe) - credits (what we paid)
      const duesMap = new Map<string, number>();
      (ledgerData || []).forEach((entry) => {
        const current = duesMap.get(entry.boat_id) || 0;
        if (entry.entry_type === "debit") {
          duesMap.set(entry.boat_id, current + Number(entry.amount));
        } else {
          duesMap.set(entry.boat_id, current - Number(entry.amount));
        }
      });
      setLedgerDues(duesMap);
    } catch (err) {
      console.error("Failed to fetch boats:", err);
      toast.error("Failed to load boats");
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingBoat(null);
    setForm({ name: "", registration: "", engine_details: "" });
    setDialogOpen(true);
  }

  function openEditDialog(boat: Boat) {
    setEditingBoat(boat);
    setForm({
      name: boat.name,
      registration: boat.registration,
      engine_details: boat.engine_details ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name || !form.registration) {
      toast.error("Name and registration are required");
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabaseClient();
      if (editingBoat) {
        const { error } = await supabase
          .from("boats")
          .update({
            name: form.name,
            registration: form.registration,
            engine_details: form.engine_details || null,
          })
          .eq("id", editingBoat.id);

        if (error) throw error;
        toast.success("Boat updated");
      } else {
        const { error } = await supabase.from("boats").insert({
          name: form.name,
          registration: form.registration,
          engine_details: form.engine_details || null,
        });

        if (error) throw error;
        toast.success("Boat added");
      }

      setDialogOpen(false);
      fetchBoatsAndDues();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save boat");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(boat: Boat) {
    if (!confirm(`Remove "${boat.name}"? This will also delete all associated trips and data.`)) {
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from("boats").delete().eq("id", boat.id);
      if (error) throw error;
      toast.success("Boat removed");
      fetchBoatsAndDues();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete boat");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Fleet Manager</h1>
          <p className="text-muted-foreground">Manage your fishing boats</p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Boat
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Boats</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : boats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No boats registered. Add your first boat to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Engine Details</TableHead>
                  <TableHead className="text-right">Maintenance Dues</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boats.map((boat) => (
                  <TableRow key={boat.id}>
                    <TableCell className="font-medium">
                      <button
                        onClick={() => router.push(`/boats/${boat.id}`)}
                        className="flex items-center gap-2 cursor-pointer text-left hover:text-primary transition-colors"
                      >
                        <Ship className="h-4 w-4 text-muted-foreground shrink-0" />
                        {boat.name}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{boat.registration}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {boat.engine_details || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {ledgerDues.has(boat.id) ? (
                        <span
                          className={`font-medium ${
                            (ledgerDues.get(boat.id) || 0) > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                            maximumFractionDigits: 0,
                          }).format(ledgerDues.get(boat.id) || 0)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(boat)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(boat)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBoat ? "Edit Boat" : "Add Boat"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Boat Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Sea Queen"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration">Registration *</Label>
              <Input
                id="registration"
                value={form.registration}
                onChange={(e) =>
                  setForm({ ...form, registration: e.target.value })
                }
                placeholder="e.g., IND-MP-2024-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="engine">Engine Details</Label>
              <Input
                id="engine"
                value={form.engine_details}
                onChange={(e) =>
                  setForm({ ...form, engine_details: e.target.value })
                }
                placeholder="e.g., Leyland Iron Boat - 120HP"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editingBoat ? "Update" : "Add Boat"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

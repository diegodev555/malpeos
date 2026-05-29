"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PlusCircle, Users, ExternalLink } from "lucide-react";
import type { Party, PartyWithBalance } from "@/types/database";

const PARTY_TYPES = ["vendor", "crew", "supplier", "other"] as const;

export default function AccountsPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [parties, setParties] = useState<PartyWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "vendor" as Party["type"],
    contact: "",
    notes: "",
  });

  async function fetchParties() {
    try {
      setLoading(true);
      // Fetch all parties
      const { data: partiesData, error: partiesError } = await supabase
        .from("parties")
        .select("*")
        .order("name");

      if (partiesError) throw partiesError;

      // Fetch ledger entries to compute balances
      const { data: ledgerData, error: ledgerError } = await supabase
        .from("ledger_entries")
        .select("party_id, entry_type, amount");

      if (ledgerError) throw ledgerError;

      // Compute balance for each party: credits (payments we received) - debits (expenses)
      const balanceMap = new Map<string, number>();
      (ledgerData || []).forEach((entry) => {
        const current = balanceMap.get(entry.party_id) || 0;
        if (entry.entry_type === "credit") {
          balanceMap.set(entry.party_id, current + Number(entry.amount));
        } else {
          balanceMap.set(entry.party_id, current - Number(entry.amount));
        }
      });

      const partiesWithBalance: PartyWithBalance[] = (partiesData || []).map(
        (party) => ({
          ...party,
          balance: balanceMap.get(party.id) || 0,
        })
      );

      setParties(partiesWithBalance);
    } catch (err) {
      console.error("Failed to fetch parties:", err);
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchParties();
  }, []);

  async function handleCreateParty() {
    if (!form.name.trim()) {
      toast.error("Party name is required");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("parties").insert({
        name: form.name.trim(),
        type: form.type,
        contact: form.contact.trim() || null,
        notes: form.notes.trim() || null,
      });

      if (error) throw error;

      toast.success("Account created");
      setDialogOpen(false);
      setForm({ name: "", type: "vendor", contact: "", notes: "" });
      void fetchParties();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create account"
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
    }).format(Math.abs(value));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Accounts / Ledger</h1>
          <p className="text-muted-foreground">
            Track transactions with vendors, crew, and suppliers
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : parties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No accounts yet. Create your first vendor or crew account.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parties.map((party) => (
                  <TableRow
                    key={party.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/accounts/${party.id}`)}
                  >
                    <TableCell className="font-medium">{party.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {party.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {party.contact || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          party.balance >= 0
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {party.balance >= 0 ? "" : "-"}
                        {formatCurrency(party.balance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/accounts/${party.id}`);
                        }}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Party Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="party-name">Name *</Label>
              <Input
                id="party-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Harbor Marine Services"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="party-type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(val) =>
                  setForm({ ...form, type: val as Party["type"] })
                }
              >
                <SelectTrigger id="party-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PARTY_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="party-contact">Contact</Label>
              <Input
                id="party-contact"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                placeholder="Phone or email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="party-notes">Notes</Label>
              <Input
                id="party-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateParty} disabled={saving}>
                {saving ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
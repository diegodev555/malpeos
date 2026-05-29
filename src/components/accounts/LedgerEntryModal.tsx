"use client";

import { useEffect, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Party } from "@/types/database";

interface LedgerEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  party: Party;
  onSaved: () => void;
}

export function LedgerEntryModal({
  open,
  onOpenChange,
  party,
  onSaved,
}: LedgerEntryModalProps) {
  const supabase = getSupabaseClient();

  const [boats, setBoats] = useState<{ id: string; name: string; registration: string }[]>([]);
  const [trips, setTrips] = useState<{ id: string; start_date: string; end_date: string | null; status: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const [selectedBoatId, setSelectedBoatId] = useState<string>("");
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  // Use default empty string to represent "no selection" values for Select
  const effectiveBoatId = selectedBoatId === "no-boat" ? "" : selectedBoatId;
  const effectiveTripId = selectedTripId === "no-trip" ? "" : selectedTripId;
  const [entryType, setEntryType] = useState<"debit" | "credit">("debit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Fetch boats when modal opens
  useEffect(() => {
    if (!open) return;
    async function fetchData() {
      try {
        const { data: boatsData, error: boatsError } = await supabase
          .from("boats")
          .select("id, name, registration")
          .order("name");

        if (boatsError) throw boatsError;
        setBoats(boatsData || []);
        setSelectedBoatId("");
        setSelectedTripId("");
        setEntryType("debit");
        setAmount("");
        setDescription("");
        setEntryDate(new Date().toISOString().split("T")[0]);
      } catch (err) {
        console.error("Failed to fetch boats:", err);
        toast.error("Failed to load boats");
      }
    }
    void fetchData();
  }, [open, supabase]);

  // Fetch trips when a boat is selected
  useEffect(() => {
    if (!effectiveBoatId) {
      setTrips([]);
      setSelectedTripId("");
      return;
    }

    async function fetchTrips() {
      try {
        const { data, error } = await supabase
          .from("trips")
          .select("id, start_date, end_date, status")
          .eq("boat_id", effectiveBoatId)
          .order("start_date", { ascending: false });

        if (error) throw error;
        setTrips(data || []);
        setSelectedTripId(""); // reset trip selection when boat changes
      } catch (err) {
        console.error("Failed to fetch trips:", err);
        toast.error("Failed to load trips");
      }
    }
    void fetchTrips();
  }, [effectiveBoatId, supabase]);

  async function handleSubmit() {
    // Validate
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!entryDate) {
      toast.error("Please select a date");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("ledger_entries").insert({
        party_id: party.id,
        boat_id: effectiveBoatId || null,
        trip_id: effectiveTripId || null,
        entry_type: entryType,
        amount: Number(amount),
        description: description || null,
        entry_date: entryDate,
      });

      if (error) throw error;

      toast.success("Transaction added");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add transaction"
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredTrips = effectiveBoatId
    ? trips
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Add Transaction — {party.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Entry Type */}
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={entryType === "debit" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setEntryType("debit")}
              >
                Debit (Expense)
              </Button>
              <Button
                type="button"
                variant={entryType === "credit" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setEntryType("credit")}
              >
                Credit (Payment)
              </Button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (INR)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 50000"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="entry_date">Date</Label>
            <Input
              id="entry_date"
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Dry dock maintenance"
            />
          </div>

          {/* Boat Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="boat">Associated Vessel (optional)</Label>
            <Select
              value={selectedBoatId}
              onValueChange={(val) => {
                setSelectedBoatId(val ?? "");
              }}
            >
              <SelectTrigger id="boat">
                <SelectValue placeholder="Select a boat..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-boat">— No vessel —</SelectItem>
                {boats.map((boat) => (
                  <SelectItem key={boat.id} value={boat.id}>
                    {boat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trip Dropdown (dependent on boat selection) */}
          <div className="space-y-2">
            <Label htmlFor="trip">Associated Trip (optional)</Label>
            <Select
              value={selectedTripId}
              onValueChange={(val) => setSelectedTripId(val ?? "")}
              disabled={!selectedBoatId}
            >
              <SelectTrigger id="trip">
                <SelectValue
                  placeholder={
                    selectedBoatId
                      ? "Select a trip..."
                      : "Select a boat first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-trip">— No trip —</SelectItem>
                {filteredTrips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id}>
                    {new Date(trip.start_date).toLocaleDateString("en-IN")}
                    {trip.end_date
                      ? ` — ${new Date(trip.end_date).toLocaleDateString("en-IN")}`
                      : " (Active)"}
                    {" — "}
                    <span
                      className={
                        trip.status === "active"
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }
                    >
                      {trip.status}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : "Add Transaction"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { LedgerEntryModal } from "@/components/accounts/LedgerEntryModal";
import type { Party, LedgerEntryWithRelations } from "@/types/database";

export default function PartyLedgerPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = getSupabaseClient();
  const partyId = params.party_id as string;

  const [party, setParty] = useState<Party | null>(null);
  const [entries, setEntries] = useState<LedgerEntryWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  async function fetchPartyAndLedger() {
    try {
      setLoading(true);

      // Fetch party
      const { data: partyData, error: partyError } = await supabase
        .from("parties")
        .select("*")
        .eq("id", partyId)
        .single();

      if (partyError) throw partyError;
      setParty(partyData as Party);

      // Fetch ledger entries with boat and trip joins
      const { data: entriesData, error: entriesError } = await supabase
        .from("ledger_entries")
        .select(
          `
          *,
          boats:boat_id ( id, name ),
          trips:trip_id ( id, start_date, end_date )
        `
        )
        .eq("party_id", partyId)
        .order("entry_date", { ascending: false });

      if (entriesError) throw entriesError;
      setEntries((entriesData || []) as unknown as LedgerEntryWithRelations[]);
    } catch (err) {
      console.error("Failed to fetch ledger:", err);
      toast.error("Failed to load ledger data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (partyId) {
      void fetchPartyAndLedger();
    }
  }, [partyId]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  // Compute balance from entries
  const balance = entries.reduce((sum, entry) => {
    return entry.entry_type === "credit"
      ? sum + Number(entry.amount)
      : sum - Number(entry.amount);
  }, 0);

  if (loading && !party) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!party) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Account not found</p>
          <Button
            variant="outline"
            onClick={() => router.push("/accounts")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Accounts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/accounts")}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1>{party.name}</h1>
              <Badge variant="outline" className="capitalize">
                {party.type}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {party.contact || "No contact info"}
            </p>
          </div>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Balance Card */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Current Balance
                </p>
                <p
                  className={`mt-1.5 text-2xl font-bold ${
                    balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {balance >= 0 ? "" : "-"}
                  {formatCurrency(Math.abs(balance))}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                  balance >= 0 ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {balance >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Debits (Expenses)
                </p>
                <p className="mt-1.5 text-2xl font-bold text-red-600">
                  {formatCurrency(
                    entries
                      .filter((e) => e.entry_type === "debit")
                      .reduce((s, e) => s + Number(e.amount), 0)
                  )}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Credits (Payments)
                </p>
                <p className="mt-1.5 text-2xl font-bold text-green-600">
                  {formatCurrency(
                    entries
                      .filter((e) => e.entry_type === "credit")
                      .reduce((s, e) => s + Number(e.amount), 0)
                  )}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet. Add your first transaction.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Associated Vessel</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(entry.entry_date).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          entry.entry_type === "debit"
                            ? "destructive"
                            : "default"
                        }
                        className="uppercase text-[10px]"
                      >
                        {entry.entry_type === "debit" ? "DEBIT" : "CREDIT"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        entry.entry_type === "debit"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {entry.entry_type === "debit" ? "-" : "+"}
                      {formatCurrency(Number(entry.amount))}
                    </TableCell>
                    <TableCell>
                      {entry.boat_id ? (
                        <div className="flex flex-wrap gap-1">
                          <Badge
                            variant="secondary"
                            className="text-xs whitespace-nowrap"
                          >
                            {entry.boats?.name || "Unknown Vessel"}
                          </Badge>
                          {entry.trip_id && entry.trips && (
                            <Badge
                              variant="outline"
                              className="text-xs whitespace-nowrap"
                            >
                              Trip:{" "}
                              {new Date(
                                entry.trips.start_date
                              ).toLocaleDateString("en-IN")}
                              {entry.trips.end_date
                                ? ` — ${new Date(
                                    entry.trips.end_date
                                  ).toLocaleDateString("en-IN")}`
                                : " (Active)"}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                      {entry.description || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Transaction Modal */}
      {party && (
        <LedgerEntryModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          party={party}
          onSaved={() => {
            void fetchPartyAndLedger();
          }}
        />
      )}
    </div>
  );
}
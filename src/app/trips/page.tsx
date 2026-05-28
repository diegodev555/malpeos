"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

interface TripRow {
  trip_id: string;
  boat_name: string;
  start_date: string;
  end_date: string | null;
  status: string;
  gross_revenue: number;
  total_expense: number;
  net_profit: number;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchTrips() {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("trip_summary")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (err) {
      console.error("Failed to fetch trips:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchTrips();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Trips</h1>
          <p className="text-muted-foreground">All fishing trips</p>
        </div>
        <Button nativeButton={false} render={<Link href="/trips/new" />}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Trip
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : trips.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No trips yet. Create your first trip to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Boat</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Expenses</TableHead>
                  <TableHead className="text-right">Net Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.map((trip) => (
                  <TableRow key={trip.trip_id}>
                    <TableCell className="font-medium">
                      {trip.boat_name}
                    </TableCell>
                    <TableCell>
                      {new Date(trip.start_date).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell>
                      {trip.end_date
                        ? new Date(trip.end_date).toLocaleDateString("en-IN")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          trip.status === "active" ? "default" : "secondary"
                        }
                      >
                        {trip.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(trip.gross_revenue))}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(trip.total_expense))}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        Number(trip.net_profit) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(Number(trip.net_profit))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

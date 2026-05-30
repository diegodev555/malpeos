import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@malpeos/shared";
import type { TripSummary, TripBill } from "@malpeos/shared";

export interface TripRow extends TripSummary {}

async function fetchTrips(): Promise<TripRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("trip_summary")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) throw error;
  return (data || []) as TripRow[];
}

async function fetchBillsForTrip(tripId: string): Promise<TripBill[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("trip_bills")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as TripBill[];
}

export function useTrips() {
  return useQuery({
    queryKey: ["trips"],
    queryFn: fetchTrips,
    staleTime: 1000 * 60 * 2,
  });
}

export function useTripBills(tripId: string | null) {
  return useQuery({
    queryKey: ["trip-bills", tripId],
    queryFn: () => fetchBillsForTrip(tripId!),
    enabled: !!tripId,
    staleTime: 1000 * 60 * 1,
  });
}
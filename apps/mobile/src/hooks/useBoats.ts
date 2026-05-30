import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@malpeos/shared";
import type { Boat, TripSummary } from "@malpeos/shared";

async function fetchBoats(): Promise<Boat[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("boats")
    .select("*")
    .order("name");

  if (error) throw error;
  return (data || []) as Boat[];
}

async function fetchBoatById(id: string): Promise<Boat> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("boats")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Boat;
}

async function fetchTripsForBoat(boatId: string): Promise<TripSummary[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("trip_summary")
    .select("*")
    .eq("boat_id", boatId)
    .order("start_date", { ascending: false });

  if (error) throw error;
  return (data || []) as TripSummary[];
}

export function useBoats() {
  return useQuery({
    queryKey: ["boats"],
    queryFn: fetchBoats,
    staleTime: 1000 * 60 * 5,
  });
}

export function useBoatDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["boat", id],
    queryFn: () => fetchBoatById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useBoatTrips(boatId: string | undefined) {
  return useQuery({
    queryKey: ["boat-trips", boatId],
    queryFn: () => fetchTripsForBoat(boatId!),
    enabled: !!boatId,
    staleTime: 1000 * 60 * 2,
  });
}
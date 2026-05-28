"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Ship, TrendingUp, TrendingDown, Calendar, DollarSign, Anchor, Activity, BarChart3, Fish } from "lucide-react";
import type { Boat, TripSummary } from "@/types/database";

const BUCKET_NAME = "boat-images";

interface BoatProfileData {
  boat: Boat;
  total_trips: number;
  active_trips: number;
  total_revenue: number;
  total_expense: number;
  total_net_profit: number;
}

export default function BoatProfilePage() {
  const params = useParams();
  const router = useRouter();
  const boatId = params.id as string;

  const [profile, setProfile] = useState<BoatProfileData | null>(null);
  const [recentTrips, setRecentTrips] = useState<TripSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  async function fetchImage(path: string | null) {
    if (!path) {
      setImageUrl(null);
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const { data } = await supabase.storage.from(BUCKET_NAME).download(path);
      if (data) {
        setImageUrl(URL.createObjectURL(data));
      }
    } catch {
      setImageUrl(null);
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = getSupabaseClient();

        // Fetch boat details
        const { data: boatData, error: boatError } = await supabase
          .from("boats")
          .select("*")
          .eq("id", boatId)
          .single();

        if (boatError) throw boatError;
        const boat = boatData as Boat;

        if (boat.image_url) {
          void fetchImage(boat.image_url);
        }

        // Fetch all trips for this boat from trip_summary
        const { data: tripData, error: tripError } = await supabase
          .from("trip_summary")
          .select("*")
          .eq("boat_id", boatId)
          .order("start_date", { ascending: false });

        if (tripError) throw tripError;
        const trips = (tripData || []) as TripSummary[];

        // Compute aggregated stats from trip data
        const total_trips = trips.length;
        const active_trips = trips.filter((t) => t.status === "active").length;
        const total_revenue = trips.reduce((sum, t) => sum + Number(t.gross_revenue), 0);
        const total_expense = trips.reduce((sum, t) => sum + Number(t.total_expense), 0);
        const total_net_profit = trips.reduce((sum, t) => sum + Number(t.net_profit), 0);

        setProfile({
          boat,
          total_trips,
          active_trips,
          total_revenue,
          total_expense,
          total_net_profit,
        });

        // Recent trips (top 10)
        setRecentTrips(trips.slice(0, 10));
      } catch (err) {
        console.error("Failed to fetch boat profile:", err);
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, [boatId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-surface flex flex-col items-center gap-4 rounded-3xl px-10 py-12">
          <div className="h-10 w-10 animate-pulse rounded-2xl bg-primary/20" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading boat profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-surface flex flex-col items-center gap-4 rounded-3xl px-10 py-12">
          <Ship className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Boat not found</p>
          <Button variant="outline" onClick={() => router.push("/boats")}>
            Back to Fleet Manager
          </Button>
        </div>
      </div>
    );
  }

  const isProfitable = profile.total_net_profit >= 0;
  const profitMargin = profile.total_revenue > 0
    ? ((profile.total_net_profit / profile.total_revenue) * 100)
    : 0;
  const marginColor = profitMargin >= 20 ? "text-green-600" : profitMargin >= 0 ? "text-emerald-500" : "text-red-600";
  const marginBg = profitMargin >= 0 ? "bg-green-50" : "bg-red-50";

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Button
        variant="ghost"
        className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => router.push("/boats")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Fleet Manager
      </Button>

      {/* Hero Section */}
      <div className="glass-surface relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 pointer-events-none" />
        <div className="relative flex flex-col items-center gap-6 px-6 py-10 sm:flex-row sm:items-start sm:gap-8 sm:px-10">
          {/* Profile Image */}
          <div className="shrink-0">
            {imageUrl ? (
              <div className="glass-surface h-32 w-32 overflow-hidden rounded-3xl sm:h-40 sm:w-40">
                <img src={imageUrl} alt={profile.boat.name} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="glass-surface flex h-32 w-32 items-center justify-center rounded-3xl sm:h-40 sm:w-40">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
                  <Ship className="h-12 w-12 text-primary/60" />
                </div>
              </div>
            )}
          </div>

          {/* Boat Info */}
          <div className="flex flex-1 flex-col items-center text-center sm:items-start sm:text-left">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{profile.boat.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="glass-control border-white/60 px-3 py-1 text-sm">
                <Anchor className="mr-1.5 h-3.5 w-3.5 text-primary" />
                {profile.boat.registration}
              </Badge>
              {profile.boat.engine_details && (
                <Badge variant="secondary" className="px-3 py-1 text-sm">
                  <Activity className="mr-1.5 h-3.5 w-3.5" />
                  {profile.boat.engine_details}
                </Badge>
              )}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{profile.total_trips} total trips</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>{profile.active_trips} active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-surface border-white/60">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Revenue</p>
                <p className="mt-1.5 text-2xl font-bold text-green-600">{formatCurrency(profile.total_revenue)}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-surface border-white/60">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Expenses</p>
                <p className="mt-1.5 text-2xl font-bold text-red-600">{formatCurrency(profile.total_expense)}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-surface border-white/60 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Net {isProfitable ? "Profit" : "Loss"}</p>
                <p className={`mt-1.5 text-2xl font-bold ${isProfitable ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(Math.abs(profile.total_net_profit))}
                </p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isProfitable ? "bg-green-100" : "bg-red-100"}`}>
                {isProfitable ? <TrendingUp className="h-5 w-5 text-green-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-surface border-white/60 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Profit Margin</p>
                <p className={`mt-1.5 text-2xl font-bold ${marginColor}`}>{profitMargin.toFixed(1)}%</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${marginBg}`}>
                <BarChart3 className={`h-5 w-5 ${isProfitable ? "text-green-600" : "text-red-600"}`} />
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-700 ${isProfitable ? "bg-green-500" : "bg-red-500"}`}
                style={{ width: `${Math.min(Math.abs(profitMargin), 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trips */}
      <Card className="glass-surface border-white/60">
        <CardHeader className="flex flex-row items-center justify-between px-6 pt-6">
          <CardTitle className="text-lg">Recent Trips</CardTitle>
          <Link href="/trips">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              View All
              <ArrowLeft className="h-3 w-3 rotate-180" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {recentTrips.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
              <Fish className="h-8 w-8" />
              <p className="text-sm">No trips yet for this boat</p>
              <Link href="/trips/new">
                <Button variant="outline" size="sm">Start a Trip</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTrips.map((trip) => (
                <Link
                  key={trip.trip_id}
                  href="/trips"
                  className="glass-control flex items-center gap-4 rounded-2xl border border-white/60 p-4 transition-all hover:bg-white/50 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {new Date(trip.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <Badge variant={trip.status === "active" ? "default" : "secondary"} className="text-[10px] px-2 py-0">
                        {trip.status}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                      <span>Revenue: {formatCurrency(Number(trip.gross_revenue))}</span>
                      <span>Expense: {formatCurrency(Number(trip.total_expense))}</span>
                      <span className={Number(trip.net_profit) >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        Net: {formatCurrency(Number(trip.net_profit))}
                      </span>
                    </div>
                  </div>
                  <ArrowLeft className="h-4 w-4 shrink-0 rotate-180 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
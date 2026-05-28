"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar, dayjsLocalizer, View } from "react-big-calendar";
import dayjs from "dayjs";
import { getSupabaseClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CalendarEvent } from "@/types/database";

const localizer = dayjsLocalizer(dayjs);

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());

  const fetchTrips = useCallback(async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: trips, error } = await supabase
        .from("trips")
        .select("id, boat_id, start_date, end_date, status, boats(name)")
        .order("start_date", { ascending: true });

      if (error) throw error;

      const calendarEvents: CalendarEvent[] = (trips || []).map((trip: { [key: string]: unknown }) => {
        const boatData = (trip.boats as { name: string }[]) ?? [];
        const boatName = boatData[0]?.name ?? "Unknown";
        const start = new Date(trip.start_date as string);
        const end = trip.end_date ? new Date(trip.end_date as string) : start;

        return {
          id: trip.id as string,
          title: `${boatName}${trip.status === "active" ? " ⚓" : ""}`,
          start,
          end,
          resource: {
            boat_id: trip.boat_id as string,
            boat_name: boatName,
            status: trip.status as string,
          },
        };
      });

      setEvents(calendarEvents);
    } catch (err) {
      console.error("Failed to fetch trips:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchTrips();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [fetchTrips]);

  const eventPropGetter = (event: CalendarEvent) => {
    const colors: Record<string, string> = {
      "Sea Queen": "#0ea5e9",
      "Wave Dancer": "#10b981",
      "Fish King": "#f59e0b",
    };
    const color = colors[event.resource.boat_name] ?? "#3b82f6";

    return {
      style: {
        backgroundColor: color,
        borderColor: color,
        borderRadius: "12px",
        opacity: event.resource.status === "active" ? 1 : 0.7,
        fontSize: "0.82rem",
        fontWeight: 700,
        padding: "3px 8px",
        boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.35)",
      },
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Fleet Calendar</h1>
        <p className="text-muted-foreground">
          Visual overview of boat trips at sea
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[500px] text-muted-foreground">
              Loading calendar...
            </div>
          ) : (
            <div className="h-[600px]">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                eventPropGetter={eventPropGetter}
                view={view}
                date={date}
                onView={(v) => setView(v)}
                onNavigate={(d) => setDate(d)}
                views={["month", "week", "day"]}
                popup
                className="rbc-custom"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex gap-4 items-center text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#0ea5e9]" />
          Sea Queen
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#10b981]" />
          Wave Dancer
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#f59e0b]" />
          Fish King
        </span>
        <span className="flex items-center gap-1 ml-4">
          ⚓ = Active
        </span>
      </div>
    </div>
  );
}

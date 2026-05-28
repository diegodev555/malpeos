export interface Boat {
  id: string;
  name: string;
  registration: string;
  engine_details: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  boat_id: string;
  start_date: string;
  end_date: string | null;
  status: "active" | "completed";
  created_at: string;
  updated_at: string;
}

export interface CatchLog {
  id: string;
  trip_id: string;
  species: string;
  weight_kg: number;
  price_per_kg: number;
  created_at: string;
}

export interface Expense {
  id: string;
  trip_id: string;
  category: "Fuel" | "Maintenance" | "Port Fees" | "Wages" | "Ice" | "Other";
  base_amount: number;
  gst_amount: number;
  description: string | null;
  created_at: string;
}

export interface TripSummary {
  trip_id: string;
  boat_id: string;
  boat_name: string;
  start_date: string;
  end_date: string | null;
  status: "active" | "completed";
  gross_revenue: number;
  total_base_expense: number;
  total_gst_paid: number;
  total_expense: number;
  net_profit: number;
}

// Form input types (for creating/updating records)
export interface TripFormData {
  boat_id: string;
  start_date: Date;
  end_date?: Date;
  status: "active" | "completed";
  catch_logs: CatchLogFormData[];
  expenses: ExpenseFormData[];
}

export interface CatchLogFormData {
  species: string;
  weight_kg: number;
  price_per_kg: number;
}

export interface ExpenseFormData {
  category: "Fuel" | "Maintenance" | "Port Fees" | "Wages" | "Ice" | "Other";
  base_amount: number;
  gst_amount: number;
  description?: string;
}

// Calendar event type for react-big-calendar
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    boat_id: string;
    boat_name: string;
    status: string;
  };
}
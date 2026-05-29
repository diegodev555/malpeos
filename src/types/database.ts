export interface Boat {
  id: string;
  name: string;
  registration: string;
  engine_details: string | null;
  image_url: string | null;
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

export interface TripBill {
  id: string;
  trip_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
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

// Party / Account types
export interface Party {
  id: string;
  name: string;
  type: "vendor" | "crew" | "supplier" | "other";
  contact: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LedgerEntry {
  id: string;
  party_id: string;
  boat_id: string | null;
  trip_id: string | null;
  entry_type: "debit" | "credit";
  amount: number;
  description: string | null;
  entry_date: string;
  created_at: string;
}

// Ledger entry with joined boat and trip data
export interface LedgerEntryWithRelations extends LedgerEntry {
  boats: Pick<Boat, "id" | "name"> | null;
  trips: Pick<Trip, "id" | "start_date" | "end_date"> | null;
}

export interface PartyWithBalance extends Party {
  balance: number; // positive = they owe us (credits - debits), negative = we owe them
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

export interface BoatSummary {
  boat_id: string;
  boat_name: string;
  registration: string;
  engine_details: string | null;
  image_url: string | null;
  total_trips: number;
  active_trips: number;
  total_revenue: number;
  total_expense: number;
  total_net_profit: number;
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
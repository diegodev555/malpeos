// Shared constants across web and mobile

export const ALLOWED_BILL_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

export const ALLOWED_BILL_EXTENSIONS = ".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx";

export const BILL_STORAGE_BUCKET = "trip-bills";

export const EXPENSE_CATEGORIES = [
  "Fuel",
  "Maintenance",
  "Port Fees",
  "Wages",
  "Ice",
  "Other",
] as const;

export const TRIP_STATUSES = ["active", "completed"] as const;

export const PARTY_TYPES = ["vendor", "crew", "supplier", "other"] as const;

export const CURRENCY_LOCALE = "en-IN";
export const CURRENCY_CODE = "INR";
export const CURRENCY_MAX_FRACTION = 0;

export const DATE_FORMAT_DISPLAY = "en-IN";
export const DATE_FORMAT_MONTH = { month: "short" as const, year: "2-digit" as const };
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * POST /api/setup-bills
 *
 * Initializes the storage bucket and table for trip bills.
 * Requires SUPABASE_SERVICE_ROLE_KEY in environment.
 */
export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        error:
          "Missing SUPABASE_SERVICE_ROLE_KEY. Set it in .env.local to auto-create the storage bucket.",
        instructions: [
          "1. Go to your Supabase dashboard → SQL Editor",
          "2. Run the SQL from supabase_schema.sql to create the trip_bills table",
          "3. Go to Storage → New bucket → name it 'trip-bills' (public bucket)",
          "4. Add a policy to allow public access to the bucket",
        ],
      },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Try to create the bucket (idempotent)
  const { data: bucket, error: bucketError } = await supabase.storage.createBucket(
    "trip-bills",
    {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
    }
  );

  if (bucketError && !bucketError.message.includes("already exists")) {
    return NextResponse.json(
      { error: "Failed to create bucket", details: bucketError },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Storage bucket 'trip-bills' is ready.",
  });
}
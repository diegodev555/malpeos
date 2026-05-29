"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, FileText, Trash2, Download, File, Image, FileSpreadsheet, Database, Settings, Eye, X, Expand } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TripBill, Trip } from "@/types/database";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const ALLOWED_EXTENSIONS = ".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx";
const BUCKET_NAME = "trip-bills";

interface TripOption {
  id: string;
  label: string;
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return Image;
  if (fileType.includes("spreadsheet") || fileType.includes("excel")) return FileSpreadsheet;
  if (fileType.includes("pdf") || fileType.includes("document") || fileType.includes("msword")) return FileText;
  return File;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function PreviewDialog({ bill, open, onOpenChange }: { bill: TripBill | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const supabase = getSupabaseClient();
  const [loadError, setLoadError] = useState(false);

  const isImage = bill?.file_type.startsWith("image/");
  const isPdf = bill?.file_type === "application/pdf";

  // Use public URL directly — bucket is public
  const publicUrl = bill
    ? supabase.storage.from("trip-bills").getPublicUrl(bill.storage_path).data.publicUrl
    : null;

  useEffect(() => {
    if (!open) {
      setLoadError(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="truncate text-base">
            {bill?.file_name || "Preview"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 flex items-center justify-center bg-muted/20 rounded-lg overflow-hidden">
          {!publicUrl ? (
            <div className="text-center space-y-3 p-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No preview available
              </p>
            </div>
          ) : isImage ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={publicUrl}
                alt={bill?.file_name || "Preview"}
                className="max-w-full max-h-full object-contain rounded-lg"
                onError={() => setLoadError(true)}
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={publicUrl}
              className="w-full h-full rounded-lg"
              title={bill?.file_name || "PDF Preview"}
              onError={() => setLoadError(true)}
            />
          ) : (
            <div className="text-center space-y-3 p-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Preview not available for this file type
              </p>
              <p className="text-xs text-muted-foreground">
                Try downloading the file instead
              </p>
            </div>
          )}
          {loadError && (
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-destructive text-sm bg-background/80 rounded-lg p-2">
                Failed to load preview
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function BillsPage() {
  const supabase = getSupabaseClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [bills, setBills] = useState<TripBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [billsLoading, setBillsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewBillId, setPreviewBillId] = useState<string | null>(null);
  const previewBill = previewBillId ? bills.find(b => b.id === previewBillId) || null : null;
  const [needsSetup, setNeedsSetup] = useState(false);
  const [setupStep, setSetupStep] = useState<"table" | "bucket" | null>(null);

  async function checkSetup() {
    try {
      // Check if trip_bills table exists
      const { error: tableCheck } = await supabase
        .from("trip_bills")
        .select("id", { count: "exact", head: true });

      if (tableCheck && tableCheck.message.includes("Could not find the table")) {
        setNeedsSetup(true);
        setSetupStep("table");
        return;
      }

      // Check if storage bucket exists by trying to list files
      const { error: bucketCheck } = await supabase.storage
        .from("trip-bills")
        .list();

      if (bucketCheck && bucketCheck.message.includes("Bucket not found")) {
        setNeedsSetup(true);
        setSetupStep("bucket");
        return;
      }

      setNeedsSetup(false);
      setSetupStep(null);
    } catch {
      // Silently fail, setup will be prompted on upload attempt
    }
  }

  async function fetchTrips() {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("id, boat_id, start_date, end_date, status")
        .order("start_date", { ascending: false });

      if (error) throw error;

      // Get boat names
      const boatIds = [...new Set((data || []).map((t: any) => t.boat_id))];
      const { data: boats } = await supabase
        .from("boats")
        .select("id, name")
        .in("id", boatIds);

      const boatMap = new Map((boats || []).map((b: any) => [b.id, b.name]));

      const options: TripOption[] = (data || []).map((t: any) => ({
        id: t.id,
        label: `${boatMap.get(t.boat_id) || "Unknown"} — ${new Date(t.start_date).toLocaleDateString("en-IN")}${t.end_date ? ` → ${new Date(t.end_date).toLocaleDateString("en-IN")}` : ""} (${t.status})`,
      }));

      setTrips(options);
    } catch (err) {
      console.error("Failed to fetch trips:", err);
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  }

  async function fetchBills(tripId: string) {
    if (!tripId) {
      setBills([]);
      return;
    }
    setBillsLoading(true);
    try {
      const { data, error } = await supabase
        .from("trip_bills")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBills(data || []);
    } catch (err) {
      console.error("Failed to fetch bills:", err);
      toast.error("Failed to load bills");
    } finally {
      setBillsLoading(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchTrips();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    void fetchBills(selectedTripId);
  }, [selectedTripId]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedTripId) return;

    const invalidFiles = Array.from(files).filter(
      (f) => !ALLOWED_TYPES.includes(f.type)
    );
    if (invalidFiles.length > 0) {
      toast.error(
        `Invalid file type: ${invalidFiles.map((f) => f.name).join(", ")}. Allowed: JPG, PNG, PDF, DOC, DOCX, XLS, XLSX`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (const file of Array.from(files)) {
      try {
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin";
        const uniquePath = `${selectedTripId}/${crypto.randomUUID()}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(uniquePath, file, {
            contentType: file.type,
            cacheControl: "3600",
          });

        if (uploadError) throw uploadError;

        // Insert record in trip_bills table
        const { error: dbError } = await supabase.from("trip_bills").insert({
          trip_id: selectedTripId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: uniquePath,
        });

        if (dbError) throw dbError;
        successCount++;
      } catch (err) {
        console.error("Upload failed:", err);
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} file(s) uploaded successfully`);
      void fetchBills(selectedTripId);
    }
    if (failCount > 0) {
      toast.error(`${failCount} file(s) failed to upload`);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDelete(bill: TripBill) {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([bill.storage_path]);

      if (storageError) throw storageError;

      // Delete from DB
      const { error: dbError } = await supabase
        .from("trip_bills")
        .delete()
        .eq("id", bill.id);

      if (dbError) throw dbError;

      toast.success("Bill deleted");
      void fetchBills(selectedTripId);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete bill");
    }
  }

  async function handleDownload(bill: TripBill) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(bill.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = bill.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Failed to download file");
    }
  }

  async function runAutoSetup() {
    try {
      const res = await fetch("/api/setup-bills", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Storage bucket created! Also run the SQL in Supabase SQL Editor.");
        setNeedsSetup(false);
      } else {
        if (data.instructions) {
          toast.error("Auto-setup not available. Follow the instructions below.");
        } else {
          toast.error(data.error || "Setup failed");
        }
      }
    } catch {
      toast.error("Setup request failed");
    }
  }

  useEffect(() => {
    if (!loading) {
      const t = window.setTimeout(() => { void checkSetup(); }, 500);
      return () => window.clearTimeout(t);
    }
  }, [loading]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1>Bills & Attachments</h1>
        <p className="text-muted-foreground">
          Upload and manage bills and attachments for any trip
        </p>
      </div>

      {needsSetup && (
        <Card className="border-amber-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <Database className="h-5 w-5" />
              Supabase Setup Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {setupStep === "table" && (
              <div className="space-y-3">
                <p className="text-sm">
                  The <code className="bg-amber-100 px-1 rounded">trip_bills</code> database table needs to be created.
                </p>
                <div className="glass-control rounded-xl p-4 text-sm space-y-2">
                  <p className="font-medium">1. Go to Supabase Dashboard → SQL Editor</p>
                  <p className="font-medium">2. Run this SQL (creates table + all RLS policies):</p>
                  <pre className="bg-slate-900 text-green-300 p-3 rounded-lg text-xs overflow-x-auto">
{`CREATE TABLE IF NOT EXISTS trip_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS policies
ALTER TABLE trip_bills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_trip_bills" ON trip_bills;
DROP POLICY IF EXISTS "anon_insert_trip_bills" ON trip_bills;
DROP POLICY IF EXISTS "anon_delete_trip_bills" ON trip_bills;

CREATE POLICY "anon_read_trip_bills"
  ON trip_bills FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_trip_bills"
  ON trip_bills FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_delete_trip_bills"
  ON trip_bills FOR DELETE TO anon USING (true);`}
                  </pre>
                  <p className="font-medium text-amber-700">⚠️ To check: go to Supabase → Database → Tables, confirm trip_bills exists. Then go to Authentication → Policies, verify trip_bills has SELECT, INSERT, DELETE policies for anon.</p>
                </div>
                <Button variant="outline" onClick={() => void checkSetup()}>
                  Re-check setup
                </Button>
              </div>
            )}
            {setupStep === "bucket" && (
              <div className="space-y-3">
                <p className="text-sm">
                  The <code className="bg-amber-100 px-1 rounded">trip-bills</code> storage bucket + upload policies need to be created.
                </p>
                <div className="glass-control rounded-xl p-4 text-sm space-y-2">
                  <p className="font-medium">1. Go to Supabase Dashboard → SQL Editor</p>
                  <p className="font-medium">2. Run this SQL (creates bucket + storage upload policy):</p>
                  <pre className="bg-slate-900 text-green-300 p-3 rounded-lg text-xs overflow-x-auto">
{`-- Create the bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-bills', 'trip-bills', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anon to upload files to trip-bills
DROP POLICY IF EXISTS "anon_upload_trip_bills" ON storage.objects;
CREATE POLICY "anon_upload_trip_bills"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'trip-bills');

-- Allow anon to read files from trip-bills
DROP POLICY IF EXISTS "anon_read_trip_bills" ON storage.objects;
CREATE POLICY "anon_read_trip_bills"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'trip-bills');

-- Allow anon to delete files from trip-bills
DROP POLICY IF EXISTS "anon_delete_trip_bills" ON storage.objects;
CREATE POLICY "anon_delete_trip_bills"
ON storage.objects FOR DELETE TO anon
USING (bucket_id = 'trip-bills');`}
                  </pre>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={runAutoSetup}>
                    <Settings className="h-4 w-4 mr-1" />
                    Try Auto-Setup
                  </Button>
                  <Button variant="outline" onClick={() => void checkSetup()}>
                    Re-check setup
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Select Trip</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading trips...</div>
            ) : (
              <Select value={selectedTripId} onValueChange={(val) => val && setSelectedTripId(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a trip to manage bills" />
                </SelectTrigger>
                <SelectContent>
                  {trips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {trip.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedTripId && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-500" />
                Upload Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="glass-control flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/60 p-8 text-center">
                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium mb-1">
                  Drop files here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  JPG, PNG, PDF, DOC, DOCX, XLS, XLSX — up to 10MB each
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ALLOWED_EXTENSIONS}
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Choose Files"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-500" />
                Attached Bills
                {bills.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({bills.length})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {billsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading bills...
                </div>
              ) : bills.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No bills attached to this trip yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {bills.map((bill) => {
                    const FileIcon = getFileIcon(bill.file_type);
                    return (
                      <div
                        key={bill.id}
                        className="glass-control flex items-center gap-3 rounded-xl border border-white/60 p-3"
                      >
                        <FileIcon className="h-8 w-8 shrink-0 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {bill.file_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(bill.file_size)} &middot;{" "}
                            {new Date(bill.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPreviewBillId(bill.id)}
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(bill)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(bill)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Preview Dialog */}
      <PreviewDialog
        bill={previewBill}
        open={previewBillId !== null}
        onOpenChange={(o) => { if (!o) setPreviewBillId(null); }}
      />
    </div>
  );
}
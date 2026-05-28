"use client";

import { useEffect, useState, useRef } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, Paperclip, Upload, FileText, Trash2, Download, File, Image, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import type { TripBill } from "@/types/database";

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

interface TripRow {
  trip_id: string;
  boat_id: string;
  boat_name: string;
  start_date: string;
  end_date: string | null;
  status: string;
  gross_revenue: number;
  total_expense: number;
  net_profit: number;
}

function BillUploadDialog({ tripId, tripLabel }: { tripId: string; tripLabel: string }) {
  const supabase = getSupabaseClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [bills, setBills] = useState<TripBill[]>([]);
  const [billsLoading, setBillsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function fetchBills() {
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
    } finally {
      setBillsLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      void fetchBills();
    }
  }, [open]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

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
        const uniquePath = `${tripId}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(uniquePath, file, {
            contentType: file.type,
            cacheControl: "3600",
          });

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase.from("trip_bills").insert({
          trip_id: tripId,
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
      toast.success(`${successCount} file(s) uploaded`);
      void fetchBills();
    }
    if (failCount > 0) {
      toast.error(`${failCount} file(s) failed`);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDelete(bill: TripBill) {
    try {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([bill.storage_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("trip_bills")
        .delete()
        .eq("id", bill.id);

      if (dbError) throw dbError;

      toast.success("Bill deleted");
      void fetchBills();
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7" />}>
        <Paperclip className="h-3.5 w-3.5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bills — {tripLabel}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="glass-control flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/60 p-6 text-center">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground mb-3">
              JPG, PNG, PDF, DOC, DOCX, XLS, XLSX
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_EXTENSIONS}
              onChange={handleFileUpload}
              className="hidden"
              id={`bill-upload-${tripId}`}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Choose Files"}
            </Button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1.5">
            {billsLoading ? (
              <div className="text-center py-4 text-sm text-muted-foreground">Loading...</div>
            ) : bills.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">No bills yet</div>
            ) : (
              bills.map((bill) => {
                const FileIcon = getFileIcon(bill.file_type);
                return (
                  <div
                    key={bill.id}
                    className="glass-control flex items-center gap-3 rounded-xl border border-white/60 p-2.5"
                  >
                    <FileIcon className="h-6 w-6 shrink-0 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{bill.file_name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(bill.file_size)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownload(bill)} title="Download">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(bill)} title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TripsPage() {
  const router = useRouter();
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
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.map((trip) => (
                  <TableRow key={trip.trip_id}>
                    <TableCell className="font-medium">
                      <button
                        onClick={() => router.push(`/boats/${trip.boat_id}`)}
                        className="cursor-pointer text-left hover:text-primary transition-colors"
                      >
                        {trip.boat_name}
                      </button>
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
                    <TableCell>
                      <BillUploadDialog
                        tripId={trip.trip_id}
                        tripLabel={`${trip.boat_name} — ${new Date(trip.start_date).toLocaleDateString("en-IN")}`}
                      />
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

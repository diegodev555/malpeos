import type { Metadata } from "next";
import "./globals.css";
import { NavSidebar } from "@/components/nav-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "malpeOS - Fleet Management",
  description: "Fleet management & financial tracking for commercial fishing operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex text-[15px]">
        <TooltipProvider>
          <NavSidebar />
          <main className="relative flex-1 overflow-auto p-4 pt-20 md:p-8 md:pt-8">
            {children}
          </main>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}

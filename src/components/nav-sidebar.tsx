"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Ship,
  Calendar,
  PlusCircle,
  Fish,
  Menu,
  X,
  Anchor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trips", label: "Trips", icon: Fish },
  { href: "/trips/new", label: "Log a Trip", icon: PlusCircle },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/boats", label: "Fleet Manager", icon: Ship },
];

export function NavSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar - full width */}
      <aside className="hidden md:flex w-64 border-r bg-card min-h-screen p-4 flex-col gap-2 shrink-0">
        <Link href="/" className="flex items-center gap-2 px-2 mb-6">
          <Anchor className="h-6 w-6 text-primary" />
          <span className="font-heading text-lg font-bold">malpeOS</span>
        </Link>
        <NavContent />
      </aside>

      {/* Mobile header with sheet */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center border-b bg-card px-4 h-14">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="mr-2" />}
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4">
            <div className="flex items-center gap-2 px-2 mb-6">
              <Anchor className="h-6 w-6 text-primary" />
              <span className="font-heading text-lg font-bold">malpeOS</span>
            </div>
            <NavContent onNavClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <Anchor className="h-5 w-5 text-primary mr-2" />
        <span className="font-heading font-bold">malpeOS</span>
      </div>
    </>
  );
}
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
  Anchor,
  FileText,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trips", label: "Trips", icon: Fish },
  { href: "/trips/new", label: "Log a Trip", icon: PlusCircle },
  { href: "/trips/bills", label: "Bills", icon: FileText },
  { href: "/accounts", label: "Accounts", icon: BookOpen },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/boats", label: "Fleet Manager", icon: Ship },
];

function NavContent({
  pathname,
  onNavClick,
}: {
  pathname: string;
  onNavClick?: () => void;
}) {
  return (
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
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.92rem] font-semibold transition-all",
              isActive
                ? "bg-primary text-primary-foreground shadow-[inset_0_1px_0_oklch(1_0_0_/_35%),0_12px_24px_oklch(0.46_0.145_223_/_18%)]"
                : "text-muted-foreground hover:bg-white/45 hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function NavSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar - full width */}
      <aside className="glass-surface sticky top-0 hidden min-h-screen w-[17rem] shrink-0 flex-col gap-2 rounded-none border-y-0 border-l-0 p-5 md:flex">
        <Link href="/" className="mb-7 flex items-center gap-3 px-2">
          <span className="glass-control flex size-9 items-center justify-center rounded-2xl border border-white/60">
            <Anchor className="h-5 w-5 text-primary" />
          </span>
          <span className="font-heading text-[1.75rem] font-bold tracking-normal">
            <span style={{ color: "#0B3C64" }}>malpe</span><span style={{ color: "#3CB4E5" }}>OS</span>
          </span>
        </Link>
        <NavContent pathname={pathname} />
      </aside>

      {/* Mobile header with sheet */}
      <div className="glass-surface fixed top-0 right-0 left-0 z-50 flex h-16 items-center rounded-none border-x-0 border-t-0 px-4 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="mr-2" />}
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[17rem] p-5">
            <div className="mb-7 flex items-center gap-3 px-2">
              <span className="glass-control flex size-9 items-center justify-center rounded-2xl border border-white/60">
                <Anchor className="h-5 w-5 text-primary" />
              </span>
              <span className="font-heading text-[1.75rem] font-bold tracking-normal">
                <span style={{ color: "#0B3C64" }}>malpe</span><span style={{ color: "#3CB4E5" }}>OS</span>
              </span>
            </div>
            <NavContent
              pathname={pathname}
              onNavClick={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <Anchor className="mr-2 h-5 w-5 text-primary" />
        <span className="font-heading text-xl font-bold tracking-normal">
          <span style={{ color: "#0B3C64" }}>malpe</span><span style={{ color: "#3CB4E5" }}>OS</span>
        </span>
      </div>
    </>
  );
}

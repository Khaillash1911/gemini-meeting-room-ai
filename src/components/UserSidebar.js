"use client";

import {
  Bell,
  CalendarClock,
  CalendarPlus,
  Home,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";

const userItems = [
  {
    label: "Booking",
    children: [
      { href: "/public/book", label: "Book Room", icon: CalendarPlus },
      { href: "/public#remove", label: "Remove Session", icon: LogOut },
    ],
  },
  {
    label: "Schedule",
    children: [
      { href: "/public#schedule", label: "View / Schedule", icon: CalendarClock },
    ],
  },
  { href: "/public#notifications", label: "Notifications", icon: Bell },
  { href: "/public", label: "Home", icon: Home },
];

export default function UserSidebar() {
  return (
    <DashboardSidebar
      title="User"
      subtitle="Booking Hub"
      items={userItems}
      footer={
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-[var(--sidebar-muted)]">Role</p>
            <p className="text-sm text-[var(--sidebar-text)]">User</p>
          </div>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--sidebar-border)] px-3 py-2 text-sm text-[var(--sidebar-text)] transition-colors hover:bg-[var(--sidebar-hover-bg)]"
          >
            Switch Role
          </Link>
        </div>
      }
    />
  );
}

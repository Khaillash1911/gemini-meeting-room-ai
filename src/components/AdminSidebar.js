"use client";

import {
  BarChart3,
  CalendarDays,
  CalendarX2,
  Home,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";

const adminItems = [
  {
    label: "Rooms",
    children: [
      { href: "/admin/rooms", label: "All Rooms", icon: Home },
      { href: "/admin/create-room", label: "Create Room", icon: Plus },
    ],
  },
  {
    label: "Schedules",
    children: [
      { href: "/admin#schedule", label: "Manage Schedule", icon: CalendarDays },
    ],
  },
  { href: "/admin#analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminSidebar() {
  return (
    <DashboardSidebar
      title="Admin"
      subtitle="Control Desk"
      items={adminItems}
      footer={
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-[var(--sidebar-muted)]">Role</p>
            <p className="text-sm text-[var(--sidebar-text)]">Admin</p>
          </div>
          <div className="rounded-lg border border-[var(--sidebar-border)] bg-white/5 px-3 py-2 text-xs text-[var(--sidebar-text)]">
            Gemini mode: Analytics focus
          </div>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--sidebar-border)] px-3 py-2 text-sm text-[var(--sidebar-text)] transition-colors hover:bg-[var(--sidebar-hover-bg)]"
          >
            Switch Role
          </Link>
        </div>
      }
    />
  );
}

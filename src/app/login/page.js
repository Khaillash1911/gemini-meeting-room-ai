"use client";

import Link from "next/link";
import { Shield, User } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <header className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Role</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Choose your dashboard</h1>
          <p className="text-gray-400 mt-2">
            No login needed. Pick how you want to use the app.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-300">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Admin</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Manage rooms, view QR codes, and edit inventory.
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
            >
              Enter Admin Dashboard
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-300">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">User</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Browse rooms and book meeting slots quickly.
                </p>
              </div>
            </div>
            <Link
              href="/public"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              Enter User Dashboard
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          You can switch roles any time from the sidebar.
        </p>
      </div>
    </div>
  );
}

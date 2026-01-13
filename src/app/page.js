"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-950 text-white">
      <main className="flex flex-col gap-8 row-start-2 items-center text-center max-w-2xl">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-40 animate-pulse"></div>
          <h1 className="relative text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Meeting Room AI
          </h1>
        </div>

        <p className="text-xl text-gray-400">
          Smart booking system for the modern workplace.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-8">
          {!loading && user ? (
            <>
              <Link
                href="/admin"
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 h-12 px-8 text-base font-medium shadow-lg hover:shadow-blue-500/20"
              >
                Admin Dashboard
              </Link>
              <button
                onClick={() => import("@/lib/firebase").then(m => m.auth.signOut())}
                className="rounded-full border border-solid border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#1a1a1a] hover:border-transparent text-white h-12 px-8 sm:min-w-44 text-base font-medium"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-white text-black gap-2 hover:bg-[#f2f2f2] h-12 px-8 text-base font-medium shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Get Started
            </Link>
          )}
        </div>
      </main>

      <footer className="row-start-3 text-gray-500 text-sm">
        Milestone 2 • Core Booking System
      </footer>
    </div>
  );
}

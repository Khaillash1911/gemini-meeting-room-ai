"use client";

import Link from "next/link";
import { Shield, User } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="hero-shell relative min-h-screen overflow-hidden text-white p-6 flex items-center justify-center">
      <div className="hero-bg pointer-events-none absolute inset-0">
        <div className="glow-layer glow-a" />
        <div className="glow-layer glow-b" />
        <div className="glow-layer glow-c" />
        <div className="glow-layer glow-d" />
      </div>
      <div className="relative z-10 w-full max-w-3xl">
        <header className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-white-500">Role</p>
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

        <p className="mt-8 text-center text-xs text-white-500">
          You can switch roles any time from the sidebar.
        </p>
      </div>
      <style jsx>{`
        .hero-shell {
          background: #0f172a;
          position: relative;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
            radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
            radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
          overflow: hidden;
        }
        
        /* Pastel Mesh Gradients */
        .glow-layer {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.8;
          mix-blend-mode: screen;
          animation: float 20s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glow-a {
          top: -10%;
          left: -10%;
          width: 50vw;
          height: 50vw;
          background: radial-gradient(circle, rgba(238, 174, 202, 0.8) 0%, rgba(148, 187, 233, 0) 70%); /* Pastel Pink/Blue */
          animation-delay: -5s;
        }
        
        .glow-b {
          top: 20%;
          right: -10%;
          width: 60vw;
          height: 60vw;
          background: radial-gradient(circle, rgba(169, 222, 249, 0.8) 0%, rgba(148, 187, 233, 0) 70%); /* Pastel Blue */
          animation-delay: -2s;
        }

        .glow-c {
          bottom: -20%;
          left: 20%;
          width: 70vw;
          height: 50vw;
          background: radial-gradient(circle, rgba(253, 228, 207, 0.8) 0%, rgba(255, 128, 128, 0) 70%); /* Pastel Yellow/Peach */
          animation-delay: -10s;
        }

        /* Fourth blob for extra color */
        .glow-d {
          bottom: 10%;
          left: -10%;
          width: 40vw;
          height: 40vw;
          background: radial-gradient(circle, rgba(212, 165, 165, 0.8) 0%, rgba(186, 230, 253, 0) 70%); /* Pastel Lavender */
          animation-delay: -15s;
        }

        @keyframes float {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          33% {
            transform: translate(30px, -50px) rotate(10deg) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) rotate(-5deg) scale(0.9);
          }
          100% {
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

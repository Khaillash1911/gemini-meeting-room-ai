"use client";

import { useEffect, useState } from "react";
import { getRooms } from "@/lib/db";
import Link from "next/link";
import RoomQRCode from "@/components/RoomQRCode";
import UserSidebar from "@/components/UserSidebar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Info, MapPin, Users, Calendar } from "lucide-react";

export default function BookPage() {
  const [rooms, setRooms] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const data = await getRooms();
        setRooms(data);
      } catch (error) {
        console.error("Failed to fetch rooms", error);
      } finally {
        setFetching(false);
      }
    }
    fetchRooms();
  }, []);

  return (
    <div className="dashboard-shell user-theme min-h-screen text-[var(--page-text)]">
      <UserSidebar />
      <main className="lg:pl-72 pt-16 lg:pt-0">
        <div className="relative p-6 min-h-screen overflow-hidden">
          <Breadcrumbs />
          {/* Decorative Background Blobs (User Theme) */}
          <div className="pointer-events-none absolute -top-32 right-4 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,113,133,0.3),transparent_70%)] blur-3xl" />
          <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.25),transparent_70%)] blur-3xl" />

          <div className="max-w-6xl mx-auto relative z-10">
            <header className="mb-10">
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--page-muted)]">
                Book a Room
              </p>
              <h1 className="mt-3 text-4xl sm:text-5xl font-semibold">
                Available Spaces
              </h1>
              <p className="mt-2 text-[var(--page-muted)]">
                Select a room to view its schedule and book a slot.
              </p>
            </header>

            {fetching ? (
              <div className="text-center py-20 text-[var(--page-muted)]">
                Loading rooms...
              </div>
            ) : rooms.length === 0 ? (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                <p className="text-lg font-semibold">No rooms found.</p>
                <p className="mt-2 text-sm text-[var(--page-muted)]">
                  Please check back later.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{room.name}</h3>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--page-muted)]">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} /> {room.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={14} /> {room.capacity}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Amenities Hover Tag */}
                    <div className="group/amenity relative mt-4 inline-block">
                      <span className="flex cursor-help items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-xs text-[var(--page-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]">
                        <Info size={12} /> Amenities
                      </span>
                      <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-48 origin-top-left scale-95 opacity-0 transition-all duration-200 group-hover/amenity:scale-100 group-hover/amenity:opacity-100">
                        <div className="flex flex-wrap gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xl text-[11px] text-[var(--page-muted)]">
                          {room.wifi && (
                            <span className="rounded-md bg-[var(--surface-muted)] px-1.5 py-0.5">
                              WiFi
                            </span>
                          )}
                          {room.hdmi && (
                            <span className="rounded-md bg-[var(--surface-muted)] px-1.5 py-0.5">
                              HDMI
                            </span>
                          )}
                          {room.micCam && (
                            <span className="rounded-md bg-[var(--surface-muted)] px-1.5 py-0.5">
                              Mic + Cam
                            </span>
                          )}
                          {room.whiteboard && (
                            <span className="rounded-md bg-[var(--surface-muted)] px-1.5 py-0.5">
                              Whiteboard
                            </span>
                          )}
                          {room.hasDisplay && (
                            <span className="rounded-md bg-[var(--surface-muted)] px-1.5 py-0.5">
                              {room.displayCount} Screen(s)
                            </span>
                          )}
                          {!room.wifi &&
                            !room.hdmi &&
                            !room.micCam &&
                            !room.whiteboard &&
                            !room.hasDisplay && <span>No amenities listed</span>}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white/60 px-6 py-4 text-center">
                        <RoomQRCode
                          url={`${typeof window !== 'undefined' ? window.location.origin : ''}/public/book/${room.id}`}
                          size={120}
                        />
                        <p className="mt-2 text-xs font-mono text-[var(--page-muted)]">
                          /public/book/{room.id}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4">
                      <Link
                        href={`/public/book/${room.id}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
                      >
                        <Calendar size={16} /> Book Schedule
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

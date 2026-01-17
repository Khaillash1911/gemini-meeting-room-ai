"use client";

import { useEffect, useMemo, useState } from "react";
import { getRooms } from "@/lib/db";
import Link from "next/link";
import UserSidebar from "@/components/UserSidebar";
import {
  ArrowRight,
  Bell,
  Calendar,
  CalendarClock,
  LogOut,
  MapPin,
  QrCode,
  Search,
  Users,
} from "lucide-react";

export default function UserDashboard() {
  const [rooms, setRooms] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [roomLink, setRoomLink] = useState("");

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

  const filteredRooms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return rooms;
    return rooms.filter((room) => {
      const name = (room.name || "").toLowerCase();
      const location = (room.location || "").toLowerCase();
      return name.includes(query) || location.includes(query);
    });
  }, [rooms, searchQuery]);

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) || null;

  const scheduleSessions = useMemo(() => {
    if (!rooms.length) return [];
    const labels = ["Daily standup", "Design review", "Client sync"];
    const times = ["Today - 11:00", "Tomorrow - 14:00", "Fri - 10:30"];
    return rooms.slice(0, 3).map((room, index) => ({
      id: room.id,
      title: labels[index % labels.length],
      time: times[index % times.length],
      room: room.name,
    }));
  }, [rooms]);

  const activeBookings = useMemo(() => {
    if (!rooms.length) return [];
    const labels = ["Weekly sync", "Sprint retro"];
    const times = ["Today - 16:00", "Thu - 09:00"];
    return rooms.slice(0, 2).map((room, index) => ({
      id: room.id,
      title: labels[index % labels.length],
      time: times[index % times.length],
      room: room.name,
    }));
  }, [rooms]);

  const notifications = [
    {
      id: "notice-1",
      title: "Room updates are ready to review",
      time: "2 mins ago",
    },
    {
      id: "notice-2",
      title: "A room you follow just opened a slot",
      time: "1 hour ago",
    },
    {
      id: "notice-3",
      title: "Reminder: confirm tomorrow morning booking",
      time: "Yesterday",
    },
  ];

  return (
    <div className="dashboard-shell user-theme min-h-screen bg-[var(--page-bg)] text-[var(--page-text)]">
      <UserSidebar />
      <main className="lg:pl-72 pt-16 lg:pt-0">
        <div className="relative p-6 overflow-hidden">
          <div className="pointer-events-none absolute -top-32 right-4 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.25),transparent_70%)] blur-3xl" />
          <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(4,120,87,0.2),transparent_70%)] blur-3xl" />
          <div className="max-w-6xl mx-auto">
            <section id="book" className="animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-[var(--page-muted)]">
                    User Dashboard
                  </p>
                  <h1 className="mt-3 text-4xl sm:text-5xl font-semibold">
                    Find your next room
                  </h1>
                  <p className="mt-2 text-[var(--page-muted)]">
                    Search, switch, and book in a few clicks.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs text-[var(--page-muted)]">
                  <Calendar size={14} /> Instant booking
                </div>
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--page-muted)]">
                    Book room
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Search rooms</h2>
                  <div className="mt-4 flex flex-wrap items-center gap-3 rounded-full border border-[var(--border)] bg-white px-4 py-3">
                    <Search size={16} className="text-[var(--page-muted)]" />
                    <input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search by room name or location"
                      className="min-w-[200px] flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--page-muted)]"
                    />
                    <button
                      type="button"
                      className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--accent-strong)]"
                    >
                      Search
                    </button>
                  </div>
                  <p className="mt-4 text-xs text-[var(--page-muted)]">
                    Showing {filteredRooms.length} rooms right now.
                  </p>
                </div>

                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--page-muted)]">
                    Switch rooms
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Jump to a room</h2>
                  <div className="mt-4 space-y-3 text-sm text-[var(--page-muted)]">
                    <label className="text-xs uppercase tracking-[0.2em]">
                      Pick from list
                    </label>
                    <select
                      value={selectedRoomId}
                      onChange={(event) => setSelectedRoomId(event.target.value)}
                      className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--page-text)]"
                    >
                      <option value="">Select a room</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name} - {room.location}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-3">
                      {selectedRoom ? (
                        <Link
                          href={`/public/book/${selectedRoom.id}`}
                          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--accent-strong)]"
                        >
                          Open room <ArrowRight size={14} />
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-xs font-semibold text-[var(--page-muted)]"
                          disabled
                        >
                          Choose a room
                        </button>
                      )}
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-xs font-semibold text-[var(--page-text)]"
                      >
                        <QrCode size={14} /> Scan QR
                      </button>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3 text-sm text-[var(--page-muted)]">
                    <label className="text-xs uppercase tracking-[0.2em]">
                      Or enter link
                    </label>
                    <input
                      value={roomLink}
                      onChange={(event) => setRoomLink(event.target.value)}
                      placeholder="Paste a /public/book link"
                      className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--page-text)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
                    />
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-xs font-semibold"
                    >
                      Open link
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--page-muted)]">
                    Available rooms
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Pick and book</h2>
                </div>
                <span className="text-xs text-[var(--page-muted)]">
                  {filteredRooms.length} matches
                </span>
              </div>

            {fetching ? (
              <div className="text-center py-16 text-[var(--page-muted)]">
                Loading rooms...
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                <p className="text-lg font-semibold">No rooms available yet.</p>
                <p className="mt-2 text-sm text-[var(--page-muted)]">
                  Try adjusting your search or check back later.
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-xs font-semibold"
                >
                  Back to Home
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
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
                      <Link
                        href={`/public/book/${room.id}`}
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--accent-strong)]"
                      >
                        <Calendar size={16} /> Book
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section
            id="schedule"
            className="mt-12 animate-fadeIn"
            style={{ animationDelay: "100ms" }}
          >
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--page-muted)]">
                    Schedule
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Upcoming sessions
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-muted)] px-4 py-2 text-xs text-[var(--page-muted)]">
                  <CalendarClock size={14} /> This week
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {scheduleSessions.length ? (
                  scheduleSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold">{session.title}</p>
                        <p className="mt-1 text-xs text-[var(--page-muted)]">
                          {session.time} | {session.room}
                        </p>
                      </div>
                      <Link
                        href={`/public/book/${session.id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold"
                      >
                        View details <ArrowRight size={14} />
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-6 text-center text-sm text-[var(--page-muted)]">
                    No scheduled sessions yet.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section
            id="remove"
            className="mt-12 animate-fadeIn"
            style={{ animationDelay: "140ms" }}
          >
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--page-muted)]">
                    Remove booking
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Active sessions
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-muted)] px-4 py-2 text-xs text-[var(--page-muted)]">
                  <LogOut size={14} /> Manage
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {activeBookings.length ? (
                  activeBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold">{booking.title}</p>
                        <p className="mt-1 text-xs text-[var(--page-muted)]">
                          {booking.time} | {booking.room}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-6 text-center text-sm text-[var(--page-muted)]">
                    No active bookings to remove.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section
            id="notifications"
            className="mt-12 animate-fadeIn"
            style={{ animationDelay: "180ms" }}
          >
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--page-muted)]">
                    Notifications
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Stay in the loop
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-muted)] px-4 py-2 text-xs text-[var(--page-muted)]">
                  <Bell size={14} /> Alerts
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {notifications.map((notice) => (
                  <div
                    key={notice.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">{notice.title}</p>
                      <p className="mt-1 text-xs text-[var(--page-muted)]">
                        {notice.time}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
          </div>
        </div>
      </main>
    </div>
  );
}


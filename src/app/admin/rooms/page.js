"use client";

import { useEffect, useState } from "react";
import { getRooms, deleteRoom } from "@/lib/db";
import Link from "next/link";
import RoomQRCode from "@/components/RoomQRCode";
import AdminSidebar from "@/components/AdminSidebar";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  Calendar,
  Edit,
  Info,
  MapPin,
  Plus,
  Trash2,
  Users,
  BarChart3,
  Plug,
} from "lucide-react";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

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

  const initiateDelete = (room) => {
    setRoomToDelete(room);
    setDeleteConfirmationText("");
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteConfirmationText !== "delete this room") return;

    try {
      await deleteRoom(roomToDelete.id);
      setRooms((prev) => prev.filter((r) => r.id !== roomToDelete.id));
      setIsDeleteModalOpen(false);
      setRoomToDelete(null);
    } catch (error) {
      console.error("Failed to delete room", error);
      alert("Failed to delete room");
    }
  };

  return (
    <div className="dashboard-shell admin-theme min-h-screen text-[var(--page-text)]">
      <AdminSidebar />
      <main className="lg:pl-72 pt-16 lg:pt-0">
        <div className="relative p-6 overflow-hidden min-h-screen">
          <Breadcrumbs />
          <div className="pointer-events-none absolute -top-36 right-0 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.35),transparent_70%)] blur-3xl" />
          <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.25),transparent_70%)] blur-3xl" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--page-muted)]">
                  Admin
                </p>
                <h2 className="mt-2 text-3xl sm:text-4xl font-semibold">All Rooms</h2>
                <p className="mt-2 text-[var(--page-muted)]">
                    Manage your room inventory.
                </p>
              </div>
              <Link
                href="/admin/create-room"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--accent-strong)]"
              >
                <Plus size={14} /> Add Room
              </Link>
            </div>

            {fetching ? (
              <div className="text-center py-16 text-[var(--page-muted)]">
                Loading rooms...
              </div>
            ) : rooms.length === 0 ? (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                <p className="text-lg font-semibold">No rooms found</p>
                <p className="mt-2 text-sm text-[var(--page-muted)]">
                  Create your first room to unlock analytics.
                </p>
                <Link
                  href="/admin/create-room"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-xs font-semibold"
                >
                  <Plus size={14} /> Create Room
                </Link>
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
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/edit-room/${room.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--page-text)] transition hover:-translate-y-0.5"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => initiateDelete(room)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:-translate-y-0.5"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

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
                          {room.plugPoints > 0 && (
                            <span className="rounded-md bg-[var(--surface-muted)] px-1.5 py-0.5 flex items-center gap-1">
                                <Plug size={10} /> {room.plugPoints} Plugs
                            </span>
                          )}
                          {!room.wifi &&
                            !room.hdmi &&
                            !room.micCam &&
                            !room.whiteboard &&
                            !room.hasDisplay &&
                            !room.plugPoints && <span>No amenities listed</span>}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white/60 px-6 py-4 text-center">
                        <RoomQRCode
                          url={
                            typeof window !== "undefined"
                              ? `${window.location.origin}/public/book/${room.id}`
                              : ""
                          }
                          size={120}
                        />
                        <p className="mt-2 text-xs font-mono text-[var(--page-muted)]">
                          /public/book/{room.id}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4 text-xs text-[var(--page-muted)]">
                      <Link
                        href={`/public/book/${room.id}`}
                        className="inline-flex items-center gap-2 font-semibold text-[var(--accent)]"
                      >
                        <Calendar size={14} /> Test Booking
                      </Link>
                      <span className="inline-flex items-center gap-1">
                        <BarChart3 size={14} /> Analytics ready
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete Modal */}
          {isDeleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
                <div className="flex items-center gap-3 text-red-600">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                    <Trash2 size={20} />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--page-text)]">
                    Delete room?
                  </h3>
                </div>

                <p className="mt-4 text-sm text-[var(--page-muted)]">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-[var(--page-text)]">
                    {roomToDelete?.name}
                  </span>
                  ?
                </p>

                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                  Reminder: Room deletion cannot be undone. Bookings remain and
                  must be handled manually.
                </div>

                <div className="mt-5">
                  <label className="block text-xs text-[var(--page-muted)]">
                    Type{" "}
                    <span className="rounded bg-white px-1 font-mono text-[var(--page-text)]">
                      delete this room
                    </span>{" "}
                    to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(event) =>
                      setDeleteConfirmationText(event.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
                    placeholder="delete this room"
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--page-text)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleteConfirmationText !== "delete this room"}
                    className="flex-1 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
                  >
                    Delete Room
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

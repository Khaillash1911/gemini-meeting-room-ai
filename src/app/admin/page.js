"use client";

import { useEffect, useMemo, useState } from "react";
import { getRooms, deleteRoom, getAllBookings, deleteBooking } from "@/lib/db";
import Link from "next/link";
import RoomQRCode from "@/components/RoomQRCode";
import AdminSidebar from "@/components/AdminSidebar";
import Breadcrumbs from "@/components/Breadcrumbs";
import GeminiChatBar from "@/components/GeminiChatBar";
import {
    Activity,
    BarChart3,
    Calendar,
    CalendarClock,
    Edit,
    Info,
    MapPin,
    Monitor,
    Plus,
    Send,
    Sparkles,
    Trash2,
    Users,
    Wand2,
    Plug,
    X,
    MessageSquare,
} from "lucide-react";

export default function AdminDashboard() {
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
    const [bookingToDelete, setBookingToDelete] = useState(null);

    // Gemini Analytics State
    const [geminiAnalysis, setGeminiAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const [roomsData, bookingsData] = await Promise.all([
                    getRooms(),
                    getAllBookings()
                ]);
                setRooms(roomsData);
                setBookings(bookingsData);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setFetching(false);
            }
        }
        fetchData();
    }, []);

    const handleGeminiAnalysis = async (text) => {
        setIsAnalyzing(true);
        setGeminiAnalysis(null);
        try {
            const res = await fetch("/api/admin/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestText: text }),
            });
            const data = await res.json();
            if (res.ok) {
                setGeminiAnalysis(data.analysis);
            } else {
                console.error("Analysis failed:", data.error);
                setGeminiAnalysis([{ title: "Error", severity: "warning", content: "Failed to analyze data." }]);
            }
        } catch (e) {
            console.error(e);
            setGeminiAnalysis([{ title: "Connection Error", severity: "warning", content: "Could not reach Gemini." }]);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const initiateDelete = (room) => {
        setRoomToDelete(room);
        setDeleteConfirmationText("");
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteConfirmationText !== "delete this room") return;

        try {
            await deleteRoom(roomToDelete.id);
            setRooms(prev => prev.filter(r => r.id !== roomToDelete.id));
            setIsDeleteModalOpen(false);
            setRoomToDelete(null);
        } catch (error) {
            console.error("Failed to delete room", error);
            alert("Failed to delete room");
        }
    };

    const handleDeleteBooking = (booking) => {
        setBookingToDelete(booking);
    };

    const confirmDeleteBooking = async () => {
        if(!bookingToDelete) return;
        try {
            await deleteBooking(bookingToDelete.id);
            setBookings(prev => prev.filter(b => b.id !== bookingToDelete.id));
            setBookingToDelete(null);
        } catch(e) {
            console.error(e);
            alert("Failed to delete booking");
        }
    };

    const promptSuggestions = [
        "Summarize demand by location",
        "Spot underused rooms",
        "Forecast capacity gaps",
        "Recommend amenity upgrades",
    ];

    const totalRooms = rooms.length;
    const totalCapacity = rooms.reduce(
        (sum, room) => sum + (Number(room.capacity) || 0),
        0
    );
    const avgCapacity = totalRooms ? Math.round(totalCapacity / totalRooms) : 0;
    const displayRooms = rooms.filter((room) => room.hasDisplay).length;

    const amenityCatalog = [
        { key: "wifi", label: "WiFi" },
        { key: "hdmi", label: "HDMI" },
        { key: "micCam", label: "Mic + Cam" },
        { key: "whiteboard", label: "Whiteboard" },
        { key: "hasDisplay", label: "Displays" },
    ];

    const amenityStats = amenityCatalog.map((amenity) => {
        const count = rooms.filter((room) => room[amenity.key]).length;
        const percent = totalRooms ? Math.round((count / totalRooms) * 100) : 0;
        return { ...amenity, count, percent };
    });

    const topLocations = useMemo(() => {
        const tally = rooms.reduce((acc, room) => {
            const location =
                typeof room.location === "string" && room.location.trim()
                    ? room.location.trim()
                    : "Unspecified";
            acc[location] = (acc[location] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(tally)
            .map(([location, count]) => ({ location, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 4);
    }, [rooms]);

    // REAL Schedule Data
    const realScheduleRows = useMemo(() => {
        // Sort by date/time
        return [...bookings].sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        }).map(b => {
             const room = rooms.find(r => r.id === b.roomId);
             return {
                 id: b.id,
                 title: b.name || "Booking",
                 room: room ? room.name : "Unknown Room",
                 time: `${b.time} (${b.duration}m)`,
                 day: b.date,
                 status: "Active"
             };
        });
    }, [bookings, rooms]);

    const lowestAmenity = amenityStats.reduce((lowest, amenity) => {
        if (!lowest) return amenity;
        return amenity.percent < lowest.percent ? amenity : lowest;
    }, null);

    const analyticsCards = [
        {
            label: "Total rooms",
            value: totalRooms || "0",
            note: `${totalCapacity} seats total`,
            icon: BarChart3,
        },
        {
            label: "Avg capacity",
            value: totalRooms ? avgCapacity : "0",
            note: "Seats per room",
            icon: Users,
        },
        {
            label: "Top location",
            value: topLocations[0]?.location || "None yet",
            note: topLocations[0]
                ? `${topLocations[0].count} rooms`
                : "Add room locations",
            icon: MapPin,
        },
        {
            label: "Display ready",
            value: totalRooms ? `${displayRooms}/${totalRooms}` : "0/0",
            note: "Rooms with screens",
            icon: Monitor,
        },
    ];

    const geminiSignals = [
        {
            title: "Coverage gap",
            detail: lowestAmenity
                ? `${lowestAmenity.label} is available in ${lowestAmenity.percent}% of rooms.`
                : "Add amenities to compare coverage.",
        },
        {
            title: "Capacity blend",
            detail: totalRooms
                ? `Average capacity sits at ${avgCapacity} seats per room.`
                : "Add rooms to calculate the mix.",
        },
        {
            title: "Location spread",
            detail: topLocations.length
                ? `${topLocations[0].location} leads with ${topLocations[0].count} rooms.`
                : "No locations tagged yet.",
        },
    ];

    return (
        <div className="dashboard-shell admin-theme min-h-screen text-[var(--page-text)]">
            <AdminSidebar />
            <main className="lg:pl-72 pt-16 lg:pt-0">
                <div className="relative p-6 overflow-hidden">
                    <Breadcrumbs />
                    <div className="pointer-events-none absolute -top-36 right-0 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.35),transparent_70%)] blur-3xl" />
                    <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.25),transparent_70%)] blur-3xl" />
                    <div className="max-w-6xl mx-auto">
                        <section className="animate-fadeIn">
                            <div className="flex flex-wrap items-center justify-between gap-6">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.35em] text-[var(--page-muted)]">
                                        Admin Dashboard
                                    </p>
                                    <h1 className="mt-3 text-4xl sm:text-5xl font-semibold">
                                        Room Intelligence Hub
                                    </h1>
                                    <p className="mt-2 text-[var(--page-muted)]">
                                        Direct schedules, manage rooms, and ask Gemini for instant
                                        insights.
                                    </p>
                                </div>
                                <Link
                                    href="/admin/create-room"
                                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--page-text)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <Plus size={18} /> Create Room
                                </Link>
                            </div>

                            <div className="mt-10 flex flex-col items-center">
                                <GeminiChatBar
                                    placeholder="Ask Gemini to analyze room demand, occupancy, or schedules"
                                    suggestions={promptSuggestions}
                                    onPrompt={handleGeminiAnalysis}
                                />
                                
                                {/* Analysis Result Card */}
                                {(isAnalyzing || geminiAnalysis) && (
                                    <div className="mt-6 w-full max-w-3xl animate-fadeIn rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg">
                                        {isAnalyzing ? (
                                             <div className="flex items-center gap-3 text-[var(--page-muted)]">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--page-muted)] border-t-transparent" />
                                                <span className="text-sm">Analyzing data...</span>
                                              </div>
                                        ) : Array.isArray(geminiAnalysis) ? (
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {geminiAnalysis.map((insight, idx) => (
                                                    <div key={idx} className={`rounded-2xl border p-4 ${
                                                        insight.severity === 'warning' ? 'border-orange-200 bg-orange-50/50' : 
                                                        insight.severity === 'positive' ? 'border-green-200 bg-green-50/50' : 
                                                        'border-indigo-100 bg-indigo-50/30'
                                                    }`}>
                                                        <div className="flex items-start gap-3">
                                                            <div className={`mt-1 h-2 w-2 rounded-full ${
                                                                insight.severity === 'warning' ? 'bg-orange-500' : 
                                                                insight.severity === 'positive' ? 'bg-green-500' : 
                                                                'bg-indigo-500'
                                                            }`} />
                                                            <div>
                                                                <h4 className={`text-sm font-semibold ${
                                                                    insight.severity === 'warning' ? 'text-orange-900' : 
                                                                    insight.severity === 'positive' ? 'text-green-900' : 
                                                                    'text-indigo-900'
                                                                }`}>{insight.title}</h4>
                                                                <p className="mt-1 text-sm text-[var(--page-text)] opacity-80">
                                                                    {insight.content}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-red-500">
                                                Analysis format error. Please try again.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section
                            id="analytics"
                            className="mt-12 animate-fadeIn"
                            style={{ animationDelay: "80ms" }}
                        >
                            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.25em] text-[var(--page-muted)]">
                                                Analytics
                                            </p>
                                            <h2 className="mt-2 text-2xl font-semibold">
                                                Room performance
                                            </h2>
                                        </div>
                                        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs text-[var(--page-muted)]">
                                            <Activity size={14} /> Live insights
                                        </div>
                                    </div>
                                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                        {analyticsCards.map((card) => {
                                            const Icon = card.icon;
                                            return (
                                                <div
                                                    key={card.label}
                                                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium">{card.label}</p>
                                                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-strong)] text-[var(--accent)]">
                                                            <Icon size={18} />
                                                        </span>
                                                    </div>
                                                    <p className="mt-4 text-2xl font-semibold">{card.value}</p>
                                                    <p className="mt-1 text-xs text-[var(--page-muted)]">
                                                        {card.note}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-6 rounded-2xl border border-[var(--border)] bg-white/80 p-4">
                                        <p className="text-xs uppercase tracking-[0.2em] text-[var(--page-muted)]">
                                            Amenity coverage
                                        </p>
                                        <div className="mt-3 space-y-3">
                                            {amenityStats.map((amenity) => (
                                                <div key={amenity.key} className="space-y-1">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span>{amenity.label}</span>
                                                        <span className="text-[var(--page-muted)]">
                                                            {amenity.count}/{totalRooms || 0}
                                                        </span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-white">
                                                        <div
                                                            className="h-2 rounded-full bg-[var(--accent)]"
                                                            style={{ width: `${amenity.percent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.25em] text-[var(--page-muted)]">
                                                Gemini Summary
                                            </p>
                                            <h3 className="mt-2 text-lg font-semibold">
                                                Signals to act on
                                            </h3>
                                        </div>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-strong)] text-[var(--accent)]">
                                            <Wand2 size={18} />
                                        </div>
                                    </div>
                                    <div className="mt-6 space-y-4">
                                        {geminiSignals.map((signal) => (
                                            <div
                                                key={signal.title}
                                                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                                            >
                                                <p className="text-sm font-semibold">{signal.title}</p>
                                                <p className="mt-2 text-sm text-[var(--page-muted)]">
                                                    {signal.detail}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-4">
                                        <p className="text-sm font-semibold">Location pulse</p>
                                        <div className="mt-3 space-y-2 text-sm text-[var(--page-muted)]">
                                            {topLocations.length ? (
                                                topLocations.map((location) => (
                                                    <div
                                                        key={location.location}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <span>{location.location}</span>
                                                        <span className="font-semibold text-[var(--page-text)]">
                                                            {location.count}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No rooms to analyze yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section
                            id="schedule"
                            className="mt-12 animate-fadeIn"
                            style={{ animationDelay: "140ms" }}
                        >
                            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.25em] text-[var(--page-muted)]">
                                            All Bookings
                                        </p>
                                        <h2 className="mt-2 text-2xl font-semibold">
                                            Manage Reservations
                                        </h2>
                                    </div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-muted)] px-4 py-2 text-xs text-[var(--page-muted)]">
                                        <CalendarClock size={14} /> Global View
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    {realScheduleRows.length ? (
                                        realScheduleRows.map((session) => (
                                            <div
                                                key={session.id}
                                                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold">{session.title}</p>
                                                    <p className="mt-1 text-xs text-[var(--page-muted)]">
                                                        {session.day} | {session.time} | {session.room}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--page-muted)]">
                                                        {session.status}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteBooking(session)}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:-translate-y-0.5"
                                                        aria-label="Delete schedule"
                                                        title="Override/Delete Booking"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-6 text-center text-sm text-[var(--page-muted)]">
                                            No active bookings found in the system.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>


                    </div>

                    {/* Delete Room Modal */}
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
                                        onChange={(event) => setDeleteConfirmationText(event.target.value)}
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

                    {/* Delete Booking Modal */}
                    {bookingToDelete && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                            <div className="w-full max-w-sm rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl animate-fadeIn">
                                <div className="flex items-center gap-3 text-red-600">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                                        <Trash2 size={20} />
                                    </div>
                                    <h3 className="text-xl font-semibold text-[var(--page-text)]">
                                        Override Booking?
                                    </h3>
                                </div>

                                <p className="mt-4 text-sm text-[var(--page-muted)]">
                                    You are about to forcefully remove the{" "}
                                    <span className="font-semibold text-[var(--page-text)]">
                                        {bookingToDelete.time}
                                    </span>
                                    {" "}reservation for{" "}
                                    <span className="font-semibold text-[var(--page-text)]">
                                        {bookingToDelete.room}
                                    </span>.
                                </p>

                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => setBookingToDelete(null)}
                                        className="flex-1 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--page-text)] hover:bg-[var(--surface-strong)] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDeleteBooking}
                                        className="flex-1 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                                    >
                                        Confirm Delete
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

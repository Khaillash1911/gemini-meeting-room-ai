"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getRoom, getRoomBookings, deleteBooking } from "@/lib/db";
import { Calendar, Clock, MapPin, Users, Wifi, Monitor, Mic, MonitorPlay as Presentation, Cable, Plug, X, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function AdminManageBookingPage({ params }) {
    const { roomId } = use(params);
    const router = useRouter();

    // Helper for local date string YYYY-MM-DD
    const getTodayString = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const today = getTodayString();

    // Date selection state
    const [selectedDate, setSelectedDate] = useState(today);

    // Data state
    const [room, setRoom] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [fetchingRoom, setFetchingRoom] = useState(true);

    // Interaction state
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setFetchingRoom(true);
            try {
                const [roomData, bookingsData] = await Promise.all([
                    getRoom(roomId),
                    getRoomBookings(roomId)
                ]);

                if (!roomData) {
                    alert("Room not found");
                    router.push("/admin/rooms");
                    return;
                }
                setRoom(roomData);
                setBookings(bookingsData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setFetchingRoom(false);
            }
        }
        fetchData();
    }, [roomId, router]);

    // Generate fixed 9am - 5pm slots (30 min intervals)
    const generateTimeSlots = () => {
        const slots = [];
        let start = 9 * 60; // 09:00
        const end = 17 * 60; // 17:00
        const interval = 60;

        while (start < end) {
            const h = Math.floor(start / 60);
            const m = start % 60;
            const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            slots.push(timeString);
            start += interval;
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    const changeDate = (offset) => {
        const [y, m, d] = selectedDate.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        date.setDate(date.getDate() + offset);

        const nextYear = date.getFullYear();
        const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
        const nextDay = String(date.getDate()).padStart(2, '0');
        const nextDateStr = `${nextYear}-${nextMonth}-${nextDay}`;

        // No future constraint for admin - they can view/manage any date, or keep same constraint?
        // User said "recreate original room booking layout". Original has constraint. I'll keep it for consistency but maybe loosen if requested.
        // Actually, user just said "add delete option".
        if (nextDateStr < today) return;

        setSelectedDate(nextDateStr);
    };

    const formatDayDisplay = (dateStr) => {
        if (dateStr === today) return "Today";
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long' });
    };

    const formatDateDisplay = (dateStr) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Helper to check if a slot is booked
    const getSlotStatus = (slotTime) => {
        const slotMinutes = parseInt(slotTime.split(':')[0]) * 60 + parseInt(slotTime.split(':')[1]);

        const bookingForSlot = bookings.find(b => {
            if (b.date !== selectedDate) return false;

            const bStart = parseInt(b.time.split(':')[0]) * 60 + parseInt(b.time.split(':')[1]);
            const bEnd = bStart + parseInt(b.duration);

            return slotMinutes >= bStart && slotMinutes < bEnd;
        });

        if (bookingForSlot) {
            return { status: 'booked', info: bookingForSlot };
        }
        return { status: 'available', info: null };
    };

    const handleDelete = async (bookingId) => {
        if (!confirm("Are you sure you want to delete this booking?")) return;
        setDeleting(true);
        try {
            await deleteBooking(bookingId);
            const freshBookings = await getRoomBookings(roomId);
            setBookings(freshBookings);
        } catch (error) {
            console.error("Error deleting booking:", error);
            alert("Failed to delete booking");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="dashboard-shell admin-theme min-h-screen bg-[var(--page-bg)] text-[var(--page-text)] relative">
            <AdminSidebar />

            <main className="lg:pl-72 pt-16 lg:pt-0">
                <div className="relative p-6 overflow-hidden min-h-screen">
                    <div className="pointer-events-none absolute -top-36 right-0 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.35),transparent_70%)] blur-3xl" />
                    <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.25),transparent_70%)] blur-3xl" />

                    <div className="max-w-6xl mx-auto relative z-10">
                        <Breadcrumbs dynamicSegments={{ [roomId]: room ? room.name : "Manage Bookings" }} />

                        {fetchingRoom ? (
                            <div className="mt-12 text-center py-12 rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)]">
                                <div className="animate-pulse flex flex-col items-center">
                                    <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                                    <p className="text-[var(--page-muted)] text-sm">Loading room details...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Left Column: Room Info */}
                                <div className="lg:col-span-4 space-y-6">
                                    {room && (
                                        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sticky top-6">
                                            <div className="mb-6">
                                                <p className="text-xs uppercase tracking-[0.25em] text-[var(--page-muted)] font-medium mb-1">Room</p>
                                                <h1 className="text-3xl font-bold text-[var(--page-text)] tracking-tight">{room.name}</h1>
                                            </div>

                                            <div className="space-y-4 text-sm text-[var(--page-muted)]">
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-muted)] text-[var(--page-text)] border border-[var(--border)]">
                                                        <MapPin size={16} className="text-[var(--accent-cool)]" />
                                                        <span className="font-medium">{room.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-muted)] text-[var(--page-text)] border border-[var(--border)]">
                                                        <Users size={16} className="text-[var(--accent)]" />
                                                        <span className="font-medium">Cap: {room.capacity}</span>
                                                    </div>
                                                </div>

                                                <div className="h-px bg-[var(--border)] w-full my-4" />

                                                <div>
                                                    <h3 className="text-xs uppercase tracking-[0.2em] text-[var(--page-muted)] font-semibold mb-3">Amenities</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {room.wifi && (
                                                            <div className="p-2 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--accent)]" title="WiFi">
                                                                <Wifi size={18} />
                                                            </div>
                                                        )}
                                                        {room.hdmi && (
                                                            <div className="p-2 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--accent-warm)]" title="HDMI">
                                                                <Cable size={18} />
                                                            </div>
                                                        )}
                                                        {room.micCam && (
                                                            <div className="p-2 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--accent-cool)]" title="Mic & Cam">
                                                                <Mic size={18} />
                                                            </div>
                                                        )}
                                                        {room.whiteboard && (
                                                            <div className="p-2 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--accent-warm)]" title="Whiteboard">
                                                                <Presentation size={18} />
                                                            </div>
                                                        )}
                                                        {room.hasDisplay && (
                                                            <div className="p-2 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--accent-cool)] flex items-center gap-1" title="Screens">
                                                                <Monitor size={18} /> <span className="text-xs font-bold">{room.displayCount}</span>
                                                            </div>
                                                        )}
                                                        {room.plugPoints > 0 && (
                                                            <div className="p-2 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--accent)] flex items-center gap-1" title="Plugs">
                                                                <Plug size={18} /> <span className="text-xs font-bold">{room.plugPoints}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Timetable */}
                                <div className="lg:col-span-8">
                                    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 lg:p-8 shadow-sm">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                            <div>
                                                <h2 className="text-xl font-bold flex items-center gap-2">
                                                    <Clock className="text-[var(--accent)]" />
                                                    Detailed Schedule
                                                </h2>
                                                <p className="text-sm text-[var(--page-muted)] mt-1">
                                                    View or delete bookings.
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 bg-[var(--surface-muted)] p-1 rounded-2xl border border-[var(--border)]">
                                                <button
                                                    onClick={() => changeDate(-1)}
                                                    disabled={selectedDate <= today}
                                                    className="p-2 rounded-xl hover:bg-[var(--surface)] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[var(--accent)]"
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>

                                                <div className="flex flex-col items-center justify-center w-36 px-2">
                                                    <span className="text-[10px] uppercase tracking-wider text-[var(--page-muted)] font-bold">
                                                        {formatDayDisplay(selectedDate)}
                                                    </span>
                                                    <span className="text-sm font-bold text-[var(--page-text)] whitespace-nowrap">
                                                        {formatDateDisplay(selectedDate)}
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={() => changeDate(1)}
                                                    className="p-2 rounded-xl hover:bg-[var(--surface)] transition-all text-[var(--accent)]"
                                                >
                                                    <ChevronRight size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                            {timeSlots.map((time) => {
                                                const { status, info } = getSlotStatus(time);
                                                const isBooked = status === 'booked';

                                                return (
                                                    <div
                                                        key={time}
                                                        className={`
                                                            relative flex flex-col items-start p-4 rounded-2xl border transition-all duration-200
                                                            ${isBooked
                                                                ? 'bg-purple-50 border-purple-200 shadow-sm'
                                                                : 'bg-[var(--surface-muted)] border-[var(--border)] opacity-60'
                                                            }
                                                        `}
                                                    >
                                                        <span className={`text-lg font-bold font-mono mb-1 ${isBooked ? 'text-purple-900' : 'text-[var(--page-muted)]'}`}>
                                                            {time}
                                                        </span>
                                                        <span className="text-xs font-medium uppercase tracking-wider text-[var(--page-muted)]">
                                                            {isBooked ? 'Booked' : 'Available'}
                                                        </span>

                                                        {isBooked && info && (
                                                            <div className="mt-2 w-full">
                                                                <p className="text-xs font-bold text-purple-900 truncate">
                                                                    {info.name || 'User'}
                                                                </p>
                                                                <p className="text-[10px] text-purple-700 truncate mb-3">
                                                                    {info.reason}
                                                                </p>

                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDelete(info.id);
                                                                    }}
                                                                    disabled={deleting}
                                                                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 hover:border-red-300 transition-colors"
                                                                >
                                                                    <Trash2 size={12} /> Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

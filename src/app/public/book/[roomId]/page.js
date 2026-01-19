"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { getRoom, createBooking, getRoomBookings } from "@/lib/db";
import { Calendar, Clock, ArrowLeft, MapPin, Users, Wifi, Monitor, Mic, MonitorPlay as Presentation, Cable, Plug, X, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from 'next/link';
import UserSidebar from "@/components/UserSidebar";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function BookingPage({ params }) {
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

    // Booking interaction state
    const [booking, setBooking] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    // Modal form
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

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
                    router.push("/public");
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
        const interval = 30;

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
        // Simple overlap check
        // We need to parse times to compare ranges
        // But for "is booked", we usually check if there is a booking that COVERS this slot.
        // A booking at 09:00 for 60 mins covers 09:00 and 09:30.

        const slotMinutes = parseInt(slotTime.split(':')[0]) * 60 + parseInt(slotTime.split(':')[1]);

        const bookingForSlot = bookings.find(b => {
            if (b.date !== selectedDate) return false;

            const bStart = parseInt(b.time.split(':')[0]) * 60 + parseInt(b.time.split(':')[1]);
            const bEnd = bStart + parseInt(b.duration);

            // Check if slot is within [bStart, bEnd)
            return slotMinutes >= bStart && slotMinutes < bEnd;
        });

        if (bookingForSlot) {
            return { status: 'booked', info: bookingForSlot };
        }
        return { status: 'available', info: null };
    };

    const handleSlotClick = (slotTime) => {
        const { status } = getSlotStatus(slotTime);
        if (status === 'booked') return;

        setSelectedSlot(slotTime);
        setIsModalOpen(true);
        reset({ duration: "60" }); // Default duration
    };

    const onSubmitBooking = async (data) => {
        if (!selectedSlot) return;
        setBooking(true);
        try {
            await createBooking({
                roomId,
                date: selectedDate,
                time: selectedSlot,
                duration: parseInt(data.duration),
                name: data.name,
                reason: data.reason
            });

            // Refresh bookings
            const freshBookings = await getRoomBookings(roomId);
            setBookings(freshBookings);

            alert("Booking confirmed!");
            setIsModalOpen(false);
            reset();
            setSelectedSlot(null);
        } catch (error) {
            console.error("Booking error:", error);
            alert("Failed to book room: " + error.message);
        } finally {
            setBooking(false);
        }
    };

    return (
        <div className="dashboard-shell user-theme min-h-screen bg-[var(--page-bg)] text-[var(--page-text)] relative">
            <UserSidebar />

            <main className="lg:pl-72 pt-16 lg:pt-0">
                <div className="relative p-6 overflow-hidden min-h-screen">
                    {/* Background decorations */}
                    <div className="pointer-events-none absolute -top-24 right-6 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.2),transparent_70%)] blur-3xl" />
                    <div className="pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(4,120,87,0.2),transparent_70%)] blur-3xl" />

                    <div className="max-w-6xl mx-auto relative z-10">
                        <Breadcrumbs dynamicSegments={{ [roomId]: room ? room.name : "Room Details" }} />

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
                                                    Timetable
                                                </h2>
                                                <p className="text-sm text-[var(--page-muted)] mt-1">
                                                    Select an empty slot to book. (Mon-Fri, 9am-5pm)
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 bg-[var(--surface-muted)] p-1 rounded-2xl border border-[var(--border)]">
                                                <button
                                                    onClick={() => changeDate(-1)}
                                                    disabled={selectedDate <= today}
                                                    className="p-2 rounded-xl hover:bg-[var(--surface)] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[var(--accent)]"
                                                    aria-label="Previous day"
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
                                                    aria-label="Next day"
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
                                                    <button
                                                        key={time}
                                                        onClick={() => handleSlotClick(time)}
                                                        disabled={isBooked}
                                                        className={`
                                                            relative group flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-left
                                                            ${isBooked
                                                                ? 'bg-gray-100 border-transparent opacity-60 cursor-not-allowed'
                                                                : 'bg-[var(--surface-muted)] border-[var(--border)] hover:border-[var(--accent)] hover:shadow-md cursor-pointer active:scale-95'
                                                            }
                                                        `}
                                                    >
                                                        <span className={`text-lg font-bold font-mono mb-1 ${isBooked ? 'text-gray-500' : 'text-[var(--page-text)]'}`}>
                                                            {time}
                                                        </span>
                                                        <span className="text-xs font-medium uppercase tracking-wider text-[var(--page-muted)]">
                                                            {isBooked ? 'Booked' : 'Available'}
                                                        </span>

                                                        {isBooked && info && (
                                                            <div className="mt-2 text-xs text-gray-500 truncate w-full">
                                                                by {info.name || 'User'}
                                                            </div>
                                                        )}

                                                        {!isBooked && (
                                                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]">
                                                                <CheckCircle size={18} />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Booking Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
                        <div
                            className="bg-[var(--surface)] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-[var(--border)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]">
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--page-text)]">New Booking</h3>
                                    <p className="text-xs text-[var(--page-muted)] uppercase tracking-wide mt-1">
                                        {selectedDate} at {selectedSlot}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 rounded-full hover:bg-black/5 text-[var(--page-text)] transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleSubmit(onSubmitBooking)} className="space-y-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-[0.2em] text-[var(--page-muted)] mb-2 font-semibold">
                                            Your Name
                                        </label>
                                        <input
                                            {...register("name", { required: "Name is required" })}
                                            placeholder="John Doe"
                                            className="w-full rounded-2xl border border-[var(--border)] bg-white p-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)] transition-all"
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-xs mt-1 ml-1">{errors.name.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-[0.2em] text-[var(--page-muted)] mb-2 font-semibold">
                                            Reason for Booking
                                        </label>
                                        <input
                                            {...register("reason", { required: "Reason is required" })}
                                            placeholder="Team Sync, Client Call..."
                                            className="w-full rounded-2xl border border-[var(--border)] bg-white p-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)] transition-all"
                                        />
                                        {errors.reason && (
                                            <p className="text-red-500 text-xs mt-1 ml-1">{errors.reason.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-[0.2em] text-[var(--page-muted)] mb-2 font-semibold">
                                            Duration
                                        </label>
                                        <select
                                            {...register("duration", { required: true })}
                                            className="w-full rounded-2xl border border-[var(--border)] bg-white p-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)] transition-all"
                                        >
                                            <option value="60">1 hour</option>
                                            <option value="120">2 hours</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={booking}
                                        className="w-full mt-4 rounded-2xl bg-[var(--accent)] px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-[var(--accent-strong)] hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                                    >
                                        {booking ? "Confirming..." : "Confirm Booking"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}


"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { getRoom, createBooking, getRoomBookings } from "@/lib/db";
import { Calendar, Clock, ArrowLeft, MapPin, Users, Wifi, Monitor, Mic, MonitorPlay as Presentation, Cable } from "lucide-react";
import Link from 'next/link';
import UserSidebar from "@/components/UserSidebar";

export default function BookingPage({ params }) {
    const { roomId } = use(params);

    const router = useRouter();
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            date: new Date().toISOString().split('T')[0]
        }
    });
    const selectedDate = watch("date");

    const [room, setRoom] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [fetchingRoom, setFetchingRoom] = useState(true);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        async function fetchData() {
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

    const onSubmit = async (data) => {
        setBooking(true);
        try {
            await createBooking({
                roomId,
                date: data.date,
                time: data.time,
                duration: parseInt(data.duration),
            });
            alert("Booking confirmed!");
            router.push("/public");
        } catch (error) {
            console.error("Booking error:", error);
            alert("Failed to book room");
        } finally {
            setBooking(false);
        }
    };

    const getDailyBookings = () => {
        return bookings.filter(b => b.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));
    };

    const dailyBookings = getDailyBookings();

    return (
        <div className="dashboard-shell user-theme min-h-screen bg-[var(--page-bg)] text-[var(--page-text)]">
            <UserSidebar />
            <main className="lg:pl-72 pt-16 lg:pt-0">
                <div className="relative p-6 overflow-hidden">
                    <div className="pointer-events-none absolute -top-24 right-6 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.2),transparent_70%)] blur-3xl" />
                    <div className="pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(4,120,87,0.2),transparent_70%)] blur-3xl" />
                    <div className="max-w-5xl mx-auto">
                        <Link
                            href="/public"
                            className="inline-flex items-center gap-2 text-sm text-[var(--page-muted)] transition hover:text-[var(--page-text)]"
                        >
                            <ArrowLeft size={18} /> Back to dashboard
                        </Link>

                        {fetchingRoom ? (
                            <div className="mt-6 rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--page-muted)]">
                                Loading room details...
                            </div>
                        ) : (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    {room && (
                                        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm mb-8">
                                            <p className="text-xs uppercase tracking-[0.3em] text-[var(--page-muted)]">
                                                Room
                                            </p>
                                            <h1 className="mt-3 text-3xl font-semibold">{room.name}</h1>

                                            <div className="mt-5 space-y-4 text-sm text-[var(--page-muted)]">
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={18} className="text-[var(--accent-cool)]" />
                                                        <span>{room.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Users size={18} className="text-[var(--accent)]" />
                                                        <span>Capacity: {room.capacity}</span>
                                                    </div>
                                                </div>

                                                <div className="border-t border-[var(--border)] pt-4">
                                                    <h3 className="text-xs uppercase tracking-[0.2em] text-[var(--page-muted)] font-semibold mb-3">
                                                        Amenities
                                                    </h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {room.wifi && (
                                                            <div className="flex items-center gap-2 text-sm text-[var(--page-text)] bg-[var(--surface-muted)] p-2 rounded-2xl border border-[var(--border)]">
                                                                <Wifi size={16} className="text-[var(--accent)]" /> High-Speed WiFi
                                                            </div>
                                                        )}
                                                        {room.hdmi && (
                                                            <div className="flex items-center gap-2 text-sm text-[var(--page-text)] bg-[var(--surface-muted)] p-2 rounded-2xl border border-[var(--border)]">
                                                                <Cable size={16} className="text-[var(--accent-warm)]" /> HDMI Cables
                                                            </div>
                                                        )}
                                                        {room.micCam && (
                                                            <div className="flex items-center gap-2 text-sm text-[var(--page-text)] bg-[var(--surface-muted)] p-2 rounded-2xl border border-[var(--border)]">
                                                                <Mic size={16} className="text-[var(--accent-cool)]" /> Mic and Camera
                                                            </div>
                                                        )}
                                                        {room.whiteboard && (
                                                            <div className="flex items-center gap-2 text-sm text-[var(--page-text)] bg-[var(--surface-muted)] p-2 rounded-2xl border border-[var(--border)]">
                                                                <Presentation size={16} className="text-[var(--accent-warm)]" /> Whiteboard
                                                            </div>
                                                        )}
                                                        {room.hasDisplay && (
                                                            <div className="flex items-center gap-2 text-sm text-[var(--page-text)] bg-[var(--surface-muted)] p-2 rounded-2xl border border-[var(--border)]">
                                                                <Monitor size={16} className="text-[var(--accent-cool)]" /> {room.displayCount} Screens
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Clock className="text-[var(--accent)]" /> Schedule for {selectedDate}
                                        </h3>
                                        {dailyBookings.length === 0 ? (
                                            <p className="text-[var(--page-muted)] italic text-center py-4">
                                                No bookings for this date yet.
                                            </p>
                                        ) : (
                                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                                {dailyBookings.map((b) => (
                                                    <div
                                                        key={b.id}
                                                        className="flex items-center justify-between bg-[var(--surface-muted)] p-3 rounded-2xl border border-[var(--border)]"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 rounded-full bg-[var(--accent-warm)]" />
                                                            <span className="font-mono text-lg">{b.time}</span>
                                                        </div>
                                                        <span className="text-sm text-[var(--page-muted)]">
                                                            {b.duration} mins
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm h-fit sticky top-24 lg:top-6">
                                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                        <Calendar className="text-[var(--accent-cool)]" /> Book a slot
                                    </h2>

                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                        <div>
                                            <label className="block text-xs uppercase tracking-[0.2em] text-[var(--page-muted)] mb-2">
                                                Date
                                            </label>
                                            <input
                                                type="date"
                                                {...register("date", { required: "Date is required" })}
                                                className="w-full rounded-2xl border border-[var(--border)] bg-white p-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
                                            />
                                            {errors.date && (
                                                <p className="text-red-600 text-sm mt-1">
                                                    {errors.date.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs uppercase tracking-[0.2em] text-[var(--page-muted)] mb-2">
                                                    Time
                                                </label>
                                                <div className="relative">
                                                    <Clock size={16} className="absolute left-3 top-3.5 text-[var(--page-muted)]" />
                                                    <input
                                                        type="time"
                                                        {...register("time", { required: "Time is required" })}
                                                        className="w-full rounded-2xl border border-[var(--border)] bg-white p-3 pl-10 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
                                                    />
                                                </div>
                                                {errors.time && (
                                                    <p className="text-red-600 text-sm mt-1">
                                                        {errors.time.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs uppercase tracking-[0.2em] text-[var(--page-muted)] mb-2">
                                                    Duration (min)
                                                </label>
                                                <select
                                                    {...register("duration", { required: true })}
                                                    className="w-full rounded-2xl border border-[var(--border)] bg-white p-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
                                                >
                                                    <option value="30">30 mins</option>
                                                    <option value="60">60 mins</option>
                                                    <option value="90">90 mins</option>
                                                    <option value="120">2 hours</option>
                                                </select>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={booking}
                                            className="w-full mt-4 rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:opacity-50"
                                        >
                                            {booking ? "Confirming..." : "Confirm Booking"}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { getRoom, createBooking, getRoomBookings } from "@/lib/db";
import { Calendar, Clock, ArrowLeft, MapPin, Users, Wifi, Monitor, Mic, MonitorPlay as Presentation, Cable } from "lucide-react";
import Link from 'next/link';

export default function BookingPage({ params }) {
    const { roomId } = use(params);

    const { user, loading } = useAuth();
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
        if (!loading && !user) {
            router.push(`/login?redirect=/book/${roomId}`);
        }
    }, [user, loading, router, roomId]);

    useEffect(() => {
        async function fetchData() {
            try {
                const [roomData, bookingsData] = await Promise.all([
                    getRoom(roomId),
                    getRoomBookings(roomId)
                ]);

                if (!roomData) {
                    alert("Room not found");
                    router.push("/");
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
        if (user) {
            fetchData();
        }
    }, [roomId, user, router]);

    const onSubmit = async (data) => {
        setBooking(true);
        try {
            await createBooking({
                roomId,
                userId: user.uid,
                userEmail: user.email,
                date: data.date,
                time: data.time,
                duration: parseInt(data.duration),
            });
            alert("Booking confirmed!");
            router.push("/");
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

    if (loading || (!user && loading)) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
    if (!user) return null;

    if (fetchingRoom) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading Room...</div>;

    const dailyBookings = getDailyBookings();

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <Link href="/admin" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
                        <ArrowLeft size={20} className="mr-2" /> Back
                    </Link>

                    {room && (
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-2xl mb-8">
                            <h1 className="text-3xl font-bold mb-4 text-white bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{room.name}</h1>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={18} className="text-blue-400" />
                                        <span>{room.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users size={18} className="text-purple-400" />
                                        <span>Capacity: {room.capacity}</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-700 pt-4 mt-4">
                                    <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">Amenities</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {room.wifi && (
                                            <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-700/50 p-2 rounded">
                                                <Wifi size={16} className="text-green-400" /> High-Speed WiFi
                                            </div>
                                        )}
                                        {room.hdmi && (
                                            <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-700/50 p-2 rounded">
                                                <Cable size={16} className="text-yellow-400" /> HDMI Cables
                                            </div>
                                        )}
                                        {room.micCam && (
                                            <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-700/50 p-2 rounded">
                                                <Mic size={16} className="text-red-400" /> Mic & Camera
                                            </div>
                                        )}
                                        {room.whiteboard && (
                                            <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-700/50 p-2 rounded">
                                                <Presentation size={16} className="text-orange-400" /> Whiteboard
                                            </div>
                                        )}
                                        {room.hasDisplay && (
                                            <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-700/50 p-2 rounded">
                                                <Monitor size={16} className="text-blue-400" /> {room.displayCount} Screens
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Clock className="text-teal-400" /> Schedule for {selectedDate}
                        </h3>
                        {dailyBookings.length === 0 ? (
                            <p className="text-gray-500 italic text-center py-4">No bookings for this date yet.</p>
                        ) : (
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {dailyBookings.map((b) => (
                                    <div key={b.id} className="flex items-center justify-between bg-gray-700/30 p-3 rounded border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            <span className="font-mono text-lg">{b.time}</span>
                                        </div>
                                        <span className="text-sm text-gray-400">{b.duration} mins</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 h-fit sticky top-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Calendar className="text-blue-500" /> Book a Slot
                    </h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                            <input
                                type="date"
                                {...register("date", { required: "Date is required" })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Time</label>
                                <div className="relative">
                                    <Clock size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                    <input
                                        type="time"
                                        {...register("time", { required: "Time is required" })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                {errors.time && <p className="text-red-400 text-sm mt-1">{errors.time.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Duration (min)</label>
                                <select
                                    {...register("duration", { required: true })}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
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
                            className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-lg"
                        >
                            {booking ? "Confirming..." : "Confirm Booking"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

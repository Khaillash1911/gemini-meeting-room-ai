"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { getRoom, createBooking } from "@/lib/db";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from 'next/link';

export default function BookingPage({ params }) {
    // Unwrap params using React.use() or await if async component.
    // Since this is a client component ('use client'), params is a promise in Next 15.
    const { roomId } = use(params);

    const { user, loading } = useAuth();
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [room, setRoom] = useState(null);
    const [fetchingRoom, setFetchingRoom] = useState(true);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push(`/login?redirect=/book/${roomId}`);
        }
    }, [user, loading, router, roomId]);

    useEffect(() => {
        async function fetchRoom() {
            try {
                const data = await getRoom(roomId);
                if (!data) {
                    alert("Room not found");
                    router.push("/");
                    return;
                }
                setRoom(data);
            } catch (error) {
                console.error("Error fetching room:", error);
            } finally {
                setFetchingRoom(false);
            }
        }
        if (user) {
            fetchRoom();
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

    if (loading || (!user && loading)) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
    if (!user) return null;

    if (fetchingRoom) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading Room...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-md mx-auto">
                <Link href="/admin" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
                    <ArrowLeft size={20} className="mr-2" /> Back
                </Link>

                {room && (
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-2xl mb-8">
                        <h1 className="text-2xl font-bold mb-2 text-white">{room.name}</h1>
                        <div className="text-gray-400 text-sm space-y-1">
                            <p>📍 {room.location}</p>
                            <p>👥 Capacity: {room.capacity}</p>
                        </div>
                    </div>
                )}

                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700">
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

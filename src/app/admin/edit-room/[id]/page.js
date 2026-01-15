"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { getRoom, updateRoom } from "@/lib/db";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditRoomPage({ params }) {
    const { id: roomId } = use(params);
    const { user, loading } = useAuth();
    const router = useRouter();
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
        defaultValues: {
            wifi: false,
            hdmi: false,
            micCam: false,
            whiteboard: false,
            hasDisplay: false,
            displayCount: 0
        }
    });
    const hasDisplay = watch("hasDisplay");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function fetchRoomData() {
            try {
                const roomData = await getRoom(roomId);
                if (roomData) {
                    reset(roomData);
                } else {
                    setError("Room not found");
                }
            } catch (err) {
                console.error("Error fetching room:", err);
                setError("Failed to fetch room details");
            } finally {
                setFetching(false);
            }
        }
        if (user) {
            fetchRoomData();
        }
    }, [user, roomId, reset]);

    const onSubmit = async (data) => {
        setSubmitting(true);
        setError("");
        try {
            const capacity = parseInt(data.capacity);
            const displayCount = data.hasDisplay ? parseInt(data.displayCount || "0") : 0;

            if (isNaN(capacity)) throw new Error("Invalid capacity");
            if (isNaN(displayCount)) throw new Error("Invalid display count");

            await updateRoom(roomId, {
                ...data,
                capacity,
                displayCount,
                updatedBy: user.uid,
                updatedAt: new Date(), // This will be serverTimestamp in db but good to have local
            });
            router.push("/admin");
        } catch (error) {
            console.error("Error updating room:", error);
            setError(error.message || "Failed to update room. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || (!user && loading)) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
    if (!user) return null;

    if (fetching) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading Room Details...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-2xl mx-auto">
                <Link href="/admin" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Edit Room
                </h1>

                <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-xl">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Room Name</label>
                            <input
                                {...register("name", { required: "Room name is required" })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Conference Room A"
                            />
                            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Capacity</label>
                                <input
                                    {...register("capacity", { required: "Capacity is required", min: 1 })}
                                    type="number"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. 10"
                                />
                                {errors.capacity && <p className="text-red-400 text-sm mt-1">{errors.capacity.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                                <input
                                    {...register("location", { required: "Location is required" })}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. Floor 2, East Wing"
                                />
                                {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location.message}</p>}
                            </div>
                        </div>

                        {/* Amenities Section */}
                        <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
                            <h3 className="text-lg font-semibold text-white mb-4">Amenities</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* WiFi Toggle */}
                                <div className="flex items-center justify-between">
                                    <label className="text-gray-300">High-Speed WiFi Access</label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" {...register("wifi")} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {/* HDMI Toggle */}
                                <div className="flex items-center justify-between">
                                    <label className="text-gray-300">HDMI Cables</label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" {...register("hdmi")} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {/* Mic/Cam Toggle */}
                                <div className="flex items-center justify-between">
                                    <label className="text-gray-300">Microphones & Cameras</label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" {...register("micCam")} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {/* Whiteboard Toggle */}
                                <div className="flex items-center justify-between">
                                    <label className="text-gray-300">Whiteboard</label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" {...register("whiteboard")} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>

                            {/* TV/Monitor Section */}
                            <div className="mt-6 pt-6 border-t border-gray-600">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-gray-300 font-medium">TVs or Monitors Available</label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" {...register("hasDisplay")} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {hasDisplay && (
                                    <div className="animate-fadeIn">
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Number of Screens</label>
                                        <input
                                            {...register("displayCount", { min: 1 })}
                                            type="number"
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="How many screens?"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? "Updating..." : "Update Room"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createRoom } from "@/lib/db";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateRoomPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
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

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            await createRoom({
                ...data,
                capacity: parseInt(data.capacity),
                displayCount: data.hasDisplay ? parseInt(data.displayCount || 0) : 0,
                createdBy: user.uid,
            });
            router.push("/admin");
        } catch (error) {
            console.error("Error creating room:", error);
            alert("Failed to create room. See console.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || (!user && loading)) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-2xl mx-auto">
                <Link href="/admin" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Create New Room
                </h1>

                <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-xl">
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
                                    <label className="text-gray-300 font-medium">TVs / Monitors Available</label>
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
                            {submitting ? "Creating..." : "Create Room"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

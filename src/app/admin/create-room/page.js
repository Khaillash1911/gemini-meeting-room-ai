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
    const { register, handleSubmit, formState: { errors } } = useForm();
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

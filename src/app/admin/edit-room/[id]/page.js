"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { getRoom, updateRoom } from "@/lib/db";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";
import Breadcrumbs from "@/components/Breadcrumbs";

import { ArrowLeft, Plug } from "lucide-react";

export default function EditRoomPage({ params }) {
    const { id: roomId } = use(params);
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
        fetchRoomData();
    }, [roomId, reset]);

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

    return (
        <div className="dashboard-shell admin-theme min-h-screen bg-[var(--page-bg)] text-[var(--page-text)]">
            <AdminSidebar />
            <main className="lg:pl-72 pt-16 lg:pt-0">
                <div className="relative p-6 overflow-hidden">
                    <div className="pointer-events-none absolute -top-32 right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.2),transparent_70%)] blur-3xl" />
                    <div className="pointer-events-none absolute -left-20 top-8 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(14,116,144,0.2),transparent_70%)] blur-3xl" />
                    <div className="max-w-3xl mx-auto">
                        <Breadcrumbs dynamicSegments={{ [roomId]: watch("name") || "Edit Room" }} />

                        <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
                            <div className="mb-8">
                                <p className="text-xs uppercase tracking-[0.3em] text-[var(--page-muted)]">
                                    Admin
                                </p>
                                <h1 className="mt-3 text-3xl sm:text-4xl font-semibold">Edit room</h1>
                                <p className="mt-2 text-sm text-[var(--page-muted)]">
                                    Update room settings and amenity details.
                                </p>
                            </div>

                            {fetching ? (
                                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-center text-sm text-[var(--page-muted)]">
                                    Loading room details...
                                </div>
                            ) : (
                                <>
                                    {error && (
                                        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                            {error}
                                        </div>
                                    )}
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                        <div>
                                            <label className="block text-xs uppercase tracking-[0.2em] text-[var(--page-muted)] mb-2">
                                                Room Name
                                            </label>
                                            <input
                                                {...register("name", { required: "Room name is required" })}
                                                className="w-full rounded-2xl border border-[var(--border)] bg-white p-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
                                                placeholder="e.g. Conference Room A"
                                            />
                                            {errors.name && (
                                                <p className="text-red-600 text-sm mt-1">
                                                    {errors.name.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs uppercase tracking-[0.2em] text-[var(--page-muted)] mb-2">
                                                    Capacity
                                                </label>
                                                <input
                                                    {...register("capacity", { required: "Capacity is required", min: 1 })}
                                                    type="number"
                                                    className="w-full rounded-2xl border border-[var(--border)] bg-white p-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
                                                    placeholder="e.g. 10"
                                                />
                                                {errors.capacity && (
                                                    <p className="text-red-600 text-sm mt-1">
                                                        {errors.capacity.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs uppercase tracking-[0.2em] text-[var(--page-muted)] mb-2">
                                                    Location
                                                </label>
                                                <input
                                                    {...register("location", { required: "Location is required" })}
                                                    className="w-full rounded-2xl border border-[var(--border)] bg-white p-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
                                                    placeholder="e.g. Floor 2, East Wing"
                                                />
                                                {errors.location && (
                                                    <p className="text-red-600 text-sm mt-1">
                                                        {errors.location.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-6">
                                            <h3 className="text-sm font-semibold text-[var(--page-text)] mb-4">
                                                Amenities
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="flex items-center justify-between gap-4">
                                                    <label className="text-sm text-[var(--page-text)]">
                                                        High-Speed WiFi Access
                                                    </label>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" {...register("wifi")} className="sr-only peer" />
                                                        <div className="w-11 h-6 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--ring)] peer-checked:bg-[var(--accent)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                                                    </label>
                                                </div>

                                                <div className="flex items-center justify-between gap-4">
                                                    <label className="text-sm text-[var(--page-text)]">HDMI Cables</label>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" {...register("hdmi")} className="sr-only peer" />
                                                        <div className="w-11 h-6 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--ring)] peer-checked:bg-[var(--accent)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                                                    </label>
                                                </div>

                                                <div className="flex items-center justify-between gap-4">
                                                    <label className="text-sm text-[var(--page-text)]">
                                                        Microphones and Cameras
                                                    </label>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" {...register("micCam")} className="sr-only peer" />
                                                        <div className="w-11 h-6 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--ring)] peer-checked:bg-[var(--accent)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                                                    </label>
                                                </div>

                                                <div className="flex items-center justify-between gap-4">
                                                    <label className="text-sm text-[var(--page-text)]">Whiteboard</label>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" {...register("whiteboard")} className="sr-only peer" />
                                                        <div className="w-11 h-6 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--ring)] peer-checked:bg-[var(--accent)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                                                    </label>
                                                </div>

                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <Plug size={18} className="text-[var(--page-muted)]" />
                                                        <label className="text-sm text-[var(--page-text)]">
                                                            Plug Points
                                                        </label>
                                                    </div>
                                                    <input
                                                        {...register("plugPoints", { min: 0 })}
                                                        type="number"
                                                        className="w-20 rounded-xl border border-[var(--border)] bg-white p-2 text-center text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-6 border-t border-[var(--border)]">
                                                <div className="flex items-center justify-between gap-4 mb-4">
                                                    <label className="text-sm font-medium text-[var(--page-text)]">
                                                        TVs or monitors available
                                                    </label>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" {...register("hasDisplay")} className="sr-only peer" />
                                                        <div className="w-11 h-6 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--ring)] peer-checked:bg-[var(--accent)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                                                    </label>
                                                </div>

                                                {hasDisplay && (
                                                    <div className="animate-fadeIn">
                                                        <label className="block text-xs uppercase tracking-[0.2em] text-[var(--page-muted)] mb-2">
                                                            Number of Screens
                                                        </label>
                                                        <input
                                                            {...register("displayCount", { min: 1 })}
                                                            type="number"
                                                            className="w-full rounded-2xl border border-[var(--border)] bg-white p-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
                                                            placeholder="How many screens?"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:opacity-50"
                                        >
                                            {submitting ? "Updating..." : "Update Room"}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

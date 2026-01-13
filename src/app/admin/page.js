"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getRooms } from "@/lib/db";
import Link from "next/link";
import RoomQRCode from "@/components/RoomQRCode";
import { Plus, MapPin, Users, Calendar } from "lucide-react";

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [rooms, setRooms] = useState([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function fetchRooms() {
            try {
                const data = await getRooms();
                setRooms(data);
            } catch (error) {
                console.error("Failed to fetch rooms", error);
            } finally {
                setFetching(false);
            }
        }
        if (user) {
            fetchRooms();
        }
    }, [user]);

    if (loading || (!user && loading)) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Auth...</div>;
    if (!user) return null; // Will redirect

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Admin Dashboard
                    </h1>
                    <Link
                        href="/admin/create-room"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus size={20} />
                        Add Room
                    </Link>
                </header>

                {fetching ? (
                    <div className="text-center py-20 text-gray-500">Loading rooms...</div>
                ) : rooms.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800 rounded-xl border border-gray-700">
                        <p className="text-xl text-gray-300 mb-4">No rooms found</p>
                        <Link
                            href="/admin/create-room"
                            className="text-blue-400 hover:text-blue-300 underline"
                        >
                            Create your first room
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room) => (
                            <div key={room.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg hover:border-gray-600 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-1">{room.name}</h3>
                                        <div className="flex items-center text-gray-400 text-sm gap-4">
                                            <span className="flex items-center gap-1"><MapPin size={14} /> {room.location}</span>
                                            <span className="flex items-center gap-1"><Users size={14} /> {room.capacity}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center my-4">
                                    <div className="text-center">
                                        <RoomQRCode url={`${window.location.origin}/book/${room.id}`} size={120} />
                                        <p className="text-xs text-gray-500 mt-2 font-mono">/book/{room.id}</p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center text-sm">
                                    <Link href={`/book/${room.id}`} className="text-teal-400 hover:text-teal-300 flex items-center gap-1">
                                        <Calendar size={14} /> Test Booking
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

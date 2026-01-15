"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getRooms, deleteRoom } from "@/lib/db";
import Link from "next/link";
import RoomQRCode from "@/components/RoomQRCode";
import { Plus, MapPin, Users, Calendar, Trash2, Edit, Info } from "lucide-react";

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [rooms, setRooms] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

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

    const initiateDelete = (room) => {
        setRoomToDelete(room);
        setDeleteConfirmationText("");
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteConfirmationText !== "delete this room") return;

        try {
            await deleteRoom(roomToDelete.id);
            setRooms(prev => prev.filter(r => r.id !== roomToDelete.id));
            setIsDeleteModalOpen(false);
            setRoomToDelete(null);
        } catch (error) {
            console.error("Failed to delete room", error);
            alert("Failed to delete room");
        }
    };

    if (loading || (!user && loading)) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Auth...</div>;
    if (!user) return null; // Will redirect

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 relative">
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
                            <div key={room.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg hover:border-gray-600 transition-colors relative group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-1">{room.name}</h3>
                                        <div className="flex items-center text-gray-400 text-sm gap-4 mb-2">
                                            <span className="flex items-center gap-1"><MapPin size={14} /> {room.location}</span>
                                            <span className="flex items-center gap-1"><Users size={14} /> {room.capacity}</span>
                                        </div>

                                        {/* Amenities Dropdown */}
                                        <div className="relative inline-block">
                                            <span className="peer flex items-center gap-1 text-xs font-medium text-blue-400 cursor-help bg-blue-400/10 px-2 py-1 rounded hover:bg-blue-400/20 transition-colors">
                                                <Info size={12} /> Amenities ▾
                                            </span>
                                            <div className="absolute left-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all z-10 p-2 text-sm text-gray-300">
                                                <ul className="space-y-1">
                                                    {room.wifi && <li className="flex items-center gap-2"><span>📶</span> WiFi</li>}
                                                    {room.hdmi && <li className="flex items-center gap-2"><span>🔌</span> HDMI</li>}
                                                    {room.micCam && <li className="flex items-center gap-2"><span>🎤</span> Mic & Cam</li>}
                                                    {room.whiteboard && <li className="flex items-center gap-2"><span>📝</span> Whiteboard</li>}
                                                    {room.hasDisplay && <li className="flex items-center gap-2"><span>🖥️</span> {room.displayCount} Screen(s)</li>}
                                                    {!room.wifi && !room.hdmi && !room.micCam && !room.whiteboard && !room.hasDisplay && (
                                                        <li className="text-gray-500 italic">No amenities listed</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-100 transition-opacity">
                                        <Link href={`/admin/edit-room/${room.id}`} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors">
                                            <Edit size={18} />
                                        </Link>
                                        <button onClick={() => initiateDelete(room)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
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

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 text-red-500 mb-4">
                            <div className="p-2 bg-red-500/10 rounded-full">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold">Delete Room?</h3>
                        </div>

                        <p className="text-gray-300 mb-4">
                            Are you sure you want to delete <span className="font-semibold text-white">{roomToDelete?.name}</span>?
                        </p>

                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
                            <p className="text-red-400 text-sm font-medium flex items-start gap-2">
                                <span className="text-lg leading-[0]">⚠️</span>
                                Reminder: Room deletion cannot be undone. All associated bookings will remain (orphaned) or should be manually handled.
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-2">
                                Type <span className="font-mono text-white bg-gray-700 px-1 rounded">delete this room</span> to confirm:
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmationText}
                                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all placeholder-gray-600"
                                placeholder="delete this room"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleteConfirmationText !== "delete this room"}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-bold shadow-lg shadow-red-900/20"
                            >
                                Delete Room
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

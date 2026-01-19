import { db } from "./firebase";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    deleteDoc,
    updateDoc,
} from "firebase/firestore";

// Rooms
export async function createRoom(roomData) {
    try {
        const docRef = await addDoc(collection(db, "rooms"), {
            ...roomData,
            createdAt: serverTimestamp(),
        });
        return { id: docRef.id, ...roomData };
    } catch (error) {
        console.error("Error adding room: ", error);
        throw error;
    }
}

export async function updateRoom(roomId, roomData) {
    try {
        const docRef = doc(db, "rooms", roomId);
        await updateDoc(docRef, roomData);
    } catch (error) {
        console.error("Error updating room: ", error);
        throw error;
    }
}

export async function deleteRoom(roomId) {
    try {
        await deleteDoc(doc(db, "rooms", roomId));
    } catch (error) {
        console.error("Error deleting room: ", error);
        throw error;
    }
}

export async function getRooms() {
    try {
        const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting rooms: ", error);
        throw error;
    }
}

export async function getRoom(roomId) {
    try {
        const docRef = doc(db, "rooms", roomId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting room: ", error);
        throw error;
    }
}

// Bookings
export async function createBooking(bookingData) {
    try {
        const docRef = await addDoc(collection(db, "bookings"), {
            ...bookingData,
            createdAt: serverTimestamp(),
        });
        return { id: docRef.id, ...bookingData };
    } catch (error) {
        console.error("Error creating booking: ", error);
        throw error;
    }
}

export async function getRoomBookings(roomId) {
    try {
        const q = query(
            collection(db, "bookings"),
            where("roomId", "==", roomId)
        );
        const querySnapshot = await getDocs(q);
        const bookings = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Sort client-side to avoid index requirements
        return bookings.sort((a, b) => {
            const dateA = a.date + a.time;
            const dateB = b.date + b.time;
            return dateA.localeCompare(dateB);
        });
    } catch (error) {
        console.error("Error getting bookings: ", error);
        throw error;
    }
}

export async function deleteBooking(bookingId) {
    if (!bookingId) {
        console.error("Error: bookingId is undefined or null");
        throw new Error("Invalid booking ID");
    }
    try {
        console.log("Attempting to delete booking with ID:", bookingId);
        await deleteDoc(doc(db, "bookings", bookingId));
        console.log("Successfully deleted booking:", bookingId);
    } catch (error) {
        console.error("Error deleting booking: ", error);
        throw error;
    }
}

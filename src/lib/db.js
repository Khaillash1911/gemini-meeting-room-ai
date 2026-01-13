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
            where("roomId", "==", roomId),
            orderBy("date"),
            orderBy("time")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting bookings: ", error);
        throw error;
    }
}

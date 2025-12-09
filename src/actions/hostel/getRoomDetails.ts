'use server';

import { fetchHostelRooms } from "@/lib/google/hostelSheet";

export async function getRoomDetails(roomNumber: string) {
    try {
        console.log('[GET ROOM DETAILS] Looking for room:', roomNumber);
        const rooms = await fetchHostelRooms();
        console.log('[GET ROOM DETAILS] Total rooms fetched:', rooms.length);
        console.log('[GET ROOM DETAILS] All room numbers:', rooms.map(r => r.roomNumber));

        // Try exact match first
        let room = rooms.find(r => r.roomNumber === roomNumber);

        // If not found, try case-insensitive and trimmed match
        if (!room) {
            console.log('[GET ROOM DETAILS] Exact match not found, trying case-insensitive');
            room = rooms.find(r => r.roomNumber.toString().trim().toLowerCase() === roomNumber.toString().trim().toLowerCase());
        }

        console.log('[GET ROOM DETAILS] Found room:', room);

        if (!room) {
            console.error('[GET ROOM DETAILS] Room not found. Searched for:', roomNumber);
            return { success: false, message: "Room not found" };
        }

        console.log('[GET ROOM DETAILS] Returning room data:', {
            roomNumber: room.roomNumber,
            maxOccupancy: room.maxOccupancy,
            occupantsCount: room.occupants.length
        });

        return {
            success: true,
            room: {
                roomNumber: room.roomNumber,
                hostel: room.hostel,
                maxOccupancy: room.maxOccupancy,
                occupants: room.occupants,
                currentOccupants: room.occupants.length
            }
        };
    } catch (error) {
        console.error('[GET ROOM DETAILS] Error:', error);
        return { success: false, message: (error as Error).message };
    }
}

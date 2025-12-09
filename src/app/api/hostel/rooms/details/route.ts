import { NextRequest, NextResponse } from "next/server";
import { fetchHostelRooms } from "@/lib/google/hostelSheet";

export async function POST(req: NextRequest) {
    try {
        console.log('[API ROOM DETAILS] POST request received');
        const body = await req.json();
        console.log('[API ROOM DETAILS] Request body:', body);
        const { roomNumber } = body;
        console.log('[API ROOM DETAILS] Fetching details for room:', roomNumber);

        if (!roomNumber) {
            console.log('[API ROOM DETAILS] No room number provided');
            return NextResponse.json({ success: false, message: "Room number is required" }, { status: 400 });
        }

        const rooms = await fetchHostelRooms();
        console.log('[API ROOM DETAILS] Total rooms fetched:', rooms.length);
        console.log('[API ROOM DETAILS] First few rooms:', rooms.slice(0, 3));

        const room = rooms.find(r => r.roomNumber === roomNumber);
        console.log('[API ROOM DETAILS] Searching for room:', roomNumber);
        console.log('[API ROOM DETAILS] Found room:', room);

        if (!room) {
            console.log('[API ROOM DETAILS] Room not found in list');
            return NextResponse.json({ success: false, message: "Room not found" }, { status: 404 });
        }

        console.log('[API ROOM DETAILS] Returning room with maxOccupancy:', room.maxOccupancy);
        const response = { success: true, room };
        console.log('[API ROOM DETAILS] Response object:', JSON.stringify(response));
        return NextResponse.json(response);
    } catch (error) {
        console.error('[API ROOM DETAILS] Error:', error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { addHostelRoomAction } from "@/actions/hostel/addHostelRoom";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { hostel, roomNumber, maxOccupancy } = body;

        const result = await addHostelRoomAction(hostel, roomNumber, maxOccupancy || 2);

        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error("Error in add room API:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to add room" },
            { status: 500 }
        );
    }
}

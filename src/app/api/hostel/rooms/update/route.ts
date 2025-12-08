import { NextRequest, NextResponse } from "next/server";
import { updateHostelRoomAction } from "@/actions/hostel/updateHostelRoom";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { oldRoomNumber, newRoomNumber, hostel, maxOccupancy } = body;

        const result = await updateHostelRoomAction(
            oldRoomNumber,
            newRoomNumber,
            hostel,
            maxOccupancy
        );

        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error("Error in update room API:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to update room" },
            { status: 500 }
        );
    }
}

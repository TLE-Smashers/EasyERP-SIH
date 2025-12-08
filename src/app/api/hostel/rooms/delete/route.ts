import { NextRequest, NextResponse } from "next/server";
import { deleteHostelRoomAction } from "@/actions/hostel/deleteHostelRoom";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { roomNumber } = body;

        const result = await deleteHostelRoomAction(roomNumber);

        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error("Error in delete room API:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to delete room" },
            { status: 500 }
        );
    }
}

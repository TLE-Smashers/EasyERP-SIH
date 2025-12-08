"use server";

import { deleteHostelRoom } from "@/lib/google/hostelRoomManagement";
import { revalidatePath } from "next/cache";

export async function deleteHostelRoomAction(roomNumber: string) {
    try {
        if (!roomNumber || !roomNumber.trim()) {
            return {
                success: false,
                message: "Room number is required",
            };
        }

        await deleteHostelRoom(roomNumber.trim());

        revalidatePath("/dashboard/hostel/rooms");

        return {
            success: true,
            message: `Room ${roomNumber} deleted successfully`,
        };
    } catch (error: any) {
        console.error("Error in deleteHostelRoomAction:", error);
        return {
            success: false,
            message: error.message || "Failed to delete room",
        };
    }
}

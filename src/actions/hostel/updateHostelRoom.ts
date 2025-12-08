"use server";

import { updateHostelRoom } from "@/lib/google/hostelRoomManagement";
import { revalidatePath } from "next/cache";

export async function updateHostelRoomAction(
    oldRoomNumber: string,
    newRoomNumber: string,
    hostel: "male" | "female",
    maxOccupancy: number
) {
    try {
        if (!oldRoomNumber || !oldRoomNumber.trim()) {
            return {
                success: false,
                message: "Old room number is required",
            };
        }

        if (!newRoomNumber || !newRoomNumber.trim()) {
            return {
                success: false,
                message: "New room number is required",
            };
        }

        if (!hostel || (hostel !== "male" && hostel !== "female")) {
            return {
                success: false,
                message: "Hostel type must be 'male' or 'female'",
            };
        }

        if (maxOccupancy < 1 || maxOccupancy > 4) {
            return {
                success: false,
                message: "Max occupancy must be between 1 and 4",
            };
        }

        await updateHostelRoom(
            oldRoomNumber.trim(),
            newRoomNumber.trim(),
            hostel,
            maxOccupancy
        );

        revalidatePath("/dashboard/hostel/rooms");

        return {
            success: true,
            message: `Room updated successfully`,
        };
    } catch (error: any) {
        console.error("Error in updateHostelRoomAction:", error);
        return {
            success: false,
            message: error.message || "Failed to update room",
        };
    }
}

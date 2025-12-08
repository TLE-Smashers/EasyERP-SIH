"use server";

import { addHostelRoom } from "@/lib/google/hostelRoomManagement";
import { revalidatePath } from "next/cache";

export async function addHostelRoomAction(
    hostel: "male" | "female",
    roomNumber: string,
    maxOccupancy: number
) {
    try {
        if (!roomNumber || !roomNumber.trim()) {
            return {
                success: false,
                message: "Room number is required",
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

        await addHostelRoom(hostel, roomNumber.trim(), maxOccupancy);

        revalidatePath("/dashboard/hostel/rooms");

        return {
            success: true,
            message: `Room ${roomNumber} added successfully`,
        };
    } catch (error: any) {
        console.error("Error in addHostelRoomAction:", error);
        return {
            success: false,
            message: error.message || "Failed to add room",
        };
    }
}

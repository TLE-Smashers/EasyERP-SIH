"use server";

import { updateFacultyInSheet } from "@/lib/google/sheets.faculty";

/**
 * Update faculty member status
 */
export async function changeFacultyStatus(
    id: string,
    status: "active" | "on_leave" | "inactive",
    updatedBy: string
): Promise<{
    success: boolean;
    message: string;
}> {
    try {
        if (!id) {
            return {
                success: false,
                message: "Faculty ID is required",
            };
        }

        if (!["active", "on_leave", "inactive"].includes(status)) {
            return {
                success: false,
                message: "Invalid status value",
            };
        }

        await updateFacultyInSheet(id, { status });

        return {
            success: true,
            message: `Faculty status updated to ${status}`,
        };
    } catch (error) {
        console.error("Error updating faculty status:", error);
        return {
            success: false,
            message: "Failed to update faculty status",
        };
    }
}

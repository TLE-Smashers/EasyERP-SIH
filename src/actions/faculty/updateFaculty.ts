"use server";

import { updateFacultyInSheet } from "@/lib/google/sheets.faculty";
import type { FacultyFormValues } from "@/components/faculty/FacultyForm";

/**
 * Update faculty member details
 */
export async function updateFaculty(
    id: string,
    facultyData: Partial<FacultyFormValues>
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

        await updateFacultyInSheet(id, facultyData);

        return {
            success: true,
            message: "Faculty updated successfully",
        };
    } catch (error) {
        console.error("Error updating faculty:", error);
        return {
            success: false,
            message: "Failed to update faculty member",
        };
    }
}

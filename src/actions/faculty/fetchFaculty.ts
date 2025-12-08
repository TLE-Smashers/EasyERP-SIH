"use server";

import { getFacultyById } from "@/lib/google/sheets.faculty";
import type { Faculty } from "@/types/faculty";

/**
 * Fetch single faculty member by ID
 */
export async function fetchFaculty(id: string): Promise<Faculty | null> {
    try {
        const faculty = await getFacultyById(id);
        return faculty;
    } catch (error) {
        console.error("Error fetching faculty:", error);
        throw new Error("Failed to fetch faculty details");
    }
}

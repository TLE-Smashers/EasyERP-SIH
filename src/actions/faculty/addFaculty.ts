"use server";

import { addFacultyToSheet, getFacultyById, checkDuplicateFaculty } from "@/lib/google/sheets.faculty";
import type { FacultyFormValues } from "@/components/faculty/FacultyForm";

/**
 * Add new faculty member
 */
export async function addFaculty(facultyData: FacultyFormValues): Promise<{
    success: boolean;
    message: string;
    id?: string;
}> {
    try {
        // Validate required fields
        if (!facultyData.fullName) {
            return {
                success: false,
                message: "Full name is required",
            };
        }

        if (!facultyData.email) {
            return {
                success: false,
                message: "Email is required",
            };
        }

        if (!facultyData.facultyId) {
            return {
                success: false,
                message: "Faculty ID is required",
            };
        }

        if (!facultyData.branch) {
            return {
                success: false,
                message: "Department/Branch is required",
            };
        }

        // Check if faculty ID already exists
        const existingFaculty = await getFacultyById(facultyData.facultyId);
        if (existingFaculty) {
            return {
                success: false,
                message: `Faculty ID "${facultyData.facultyId}" already exists. Please use a different ID.`,
            };
        }

        // Check if faculty with same name, email, and mobile already exists
        const duplicateFaculty = await checkDuplicateFaculty(
            facultyData.fullName,
            facultyData.email,
            facultyData.mobileNumber
        );
        if (duplicateFaculty) {
            return {
                success: false,
                message: `A faculty member with the same name, email, and mobile number already exists (Faculty ID: ${duplicateFaculty.facultyId}). Please verify the details.`,
            };
        }

        // Add to sheet
        const faculty = await addFacultyToSheet(facultyData);

        return {
            success: true,
            message: "Faculty member added successfully",
            id: faculty.facultyId
        };
    } catch (error) {
        console.error("Error adding faculty:", error);
        return {
            success: false,
            message: "Failed to add faculty member",
        };
    }
}

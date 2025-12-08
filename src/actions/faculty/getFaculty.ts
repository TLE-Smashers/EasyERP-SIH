"use server";

import { getAllFaculty } from "@/lib/google/sheets.faculty";
import type { Faculty as SimpleFaculty, FacultyStats } from "@/types/faculty";

// Interface for the faculty list view (same as simplified Faculty now)
export interface Faculty {
    id: string;
    facultyId: string;
    name: string;
    email: string;
    phone: string;
    branch: string; // department
    designation: string;
    status: string;
    joiningDate: string;
    rowIndex?: number;
}

/**
 * Get all faculty members
 */
export async function getFaculty(): Promise<Faculty[]> {
    try {
        const allFaculty = await getAllFaculty();

        // Transform to list view format
        const faculty: Faculty[] = allFaculty.map((fac: SimpleFaculty) => ({
            id: fac.id,
            facultyId: fac.facultyId,
            name: fac.fullName,
            email: fac.email,
            phone: fac.mobileNumber,
            branch: fac.branch,
            designation: fac.designation,
            status: fac.status,
            joiningDate: fac.joiningDate,
            rowIndex: fac.rowIndex,
        }));

        return faculty;
    } catch (error) {
        console.error("Error fetching faculty:", error);
        throw new Error("Failed to fetch faculty");
    }
}

/**
 * Get faculty by department/branch
 */
export async function getFacultyByDepartment(department: string): Promise<Faculty[]> {
    try {
        const faculty = await getFaculty();
        return faculty.filter((fac) => fac.branch.toLowerCase() === department.toLowerCase());
    } catch (error) {
        console.error("Error fetching faculty by department:", error);
        throw new Error("Failed to fetch faculty by department");
    }
}

/**
 * Get faculty by email
 */
export async function getFacultyByEmail(email: string) {
    try {
        console.log("[getFacultyByEmail] Fetching faculty for email:", email);
        const allFaculty = await getAllFaculty();
        console.log("[getFacultyByEmail] Total faculty fetched:", allFaculty.length);

        const faculty = allFaculty.find((fac: SimpleFaculty) => fac.email === email);

        if (faculty) {
            console.log("[getFacultyByEmail] Faculty found:", faculty.id);
        } else {
            console.log("[getFacultyByEmail] No faculty found with email:", email);
        }

        return faculty || null;
    } catch (error) {
        console.error("[getFacultyByEmail] Error fetching faculty by email:", error);
        throw new Error(`Failed to fetch faculty by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Get faculty by status
 */
export async function getFacultyByStatus(status: string): Promise<Faculty[]> {
    try {
        const faculty = await getFaculty();
        return faculty.filter((fac) => fac.status === status);
    } catch (error) {
        console.error("Error fetching faculty by status:", error);
        throw new Error("Failed to fetch faculty by status");
    }
}

/**
 * Get faculty statistics
 */
export async function getFacultyStats(): Promise<FacultyStats> {
    try {
        const faculty = await getFaculty();

        // Count by branch/department
        const departmentMap = new Map<string, number>();
        faculty.forEach((fac) => {
            const count = departmentMap.get(fac.branch) || 0;
            departmentMap.set(fac.branch, count + 1);
        });

        const departmentWise = Array.from(departmentMap.entries()).map(([department, count]) => ({
            department,
            count,
        }));

        // Count by designation
        const designationMap = new Map<string, number>();
        faculty.forEach((fac) => {
            const count = designationMap.get(fac.designation) || 0;
            designationMap.set(fac.designation, count + 1);
        });

        const designationWise = Array.from(designationMap.entries()).map(([designation, count]) => ({
            designation: designation as any,
            count,
        }));

        const stats: FacultyStats = {
            totalFaculty: faculty.length,
            activeCount: faculty.filter((fac) => fac.status === "active").length,
            onLeaveCount: 0, // No on_leave in simplified structure
            departmentWise,
            designationWise,
        };

        return stats;
    } catch (error) {
        console.error("Error fetching faculty stats:", error);
        throw new Error("Failed to fetch faculty stats");
    }
}

/**
 * Search faculty by name or faculty ID
 */
export async function searchFaculty(query: string): Promise<Faculty[]> {
    try {
        const faculty = await getFaculty();
        const searchTerm = query.toLowerCase();

        return faculty.filter(
            (fac) =>
                fac.name.toLowerCase().includes(searchTerm) ||
                fac.facultyId.toLowerCase().includes(searchTerm) ||
                fac.email.toLowerCase().includes(searchTerm)
        );
    } catch (error) {
        console.error("Error searching faculty:", error);
        throw new Error("Failed to search faculty");
    }
}

"use server";

import { fetchStudentsFromSheet, type StudentRecord } from "@/lib/google/sheets.studentTable";

export interface AlumniRecord extends StudentRecord {
    status: "graduated";
    batch: string;
}

/**
 * Calculate if a student is graduated based on admission year
 */
function isGraduated(admissionYear: string): boolean {
    try {
        const year = parseInt(admissionYear);
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth(); // 0-11

        // 4-year course, graduates after admission year + 4
        const graduationYear = year + 4;

        // Graduated if graduation year has passed or if it's current year and past June
        return currentYear > graduationYear || (currentYear === graduationYear && currentMonth >= 5);
    } catch {
        return false;
    }
}

/**
 * Generate batch string from admission year
 */
function generateBatch(admissionYear: string): string {
    try {
        const year = parseInt(admissionYear);
        return `${year}-${year + 4}`;
    } catch {
        return "N/A";
    }
}

/**
 * Fetch all graduated students (alumni)
 */
export async function fetchAllAlumni(): Promise<AlumniRecord[]> {
    try {
        const allStudents = await fetchStudentsFromSheet();

        const alumni = allStudents
            .filter(student => isGraduated(student.admissionYear))
            .map(student => ({
                ...student,
                status: "graduated" as const,
                batch: generateBatch(student.admissionYear),
            }));

        return alumni;
    } catch (error) {
        console.error("Error fetching alumni:", error);
        throw new Error("Failed to fetch alumni data");
    }
}

/**
 * Fetch alumni by email
 */
export async function getAlumniByEmail(email: string): Promise<AlumniRecord | null> {
    try {
        const alumni = await fetchAllAlumni();
        return alumni.find(a => a.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (error) {
        console.error("Error fetching alumni by email:", error);
        return null;
    }
}

/**
 * Get alumni statistics
 */
export async function getAlumniStats() {
    try {
        const alumni = await fetchAllAlumni();

        // Count by branch
        const byBranch = alumni.reduce((acc, a) => {
            acc[a.branch] = (acc[a.branch] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Count by batch
        const byBatch = alumni.reduce((acc, a) => {
            acc[a.batch] = (acc[a.batch] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            total: alumni.length,
            byBranch: Object.entries(byBranch).map(([branch, count]) => ({ branch, count })),
            byBatch: Object.entries(byBatch).map(([batch, count]) => ({ batch, count })),
        };
    } catch (error) {
        console.error("Error fetching alumni stats:", error);
        return {
            total: 0,
            byBranch: [],
            byBatch: [],
        };
    }
}

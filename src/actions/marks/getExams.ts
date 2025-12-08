"use server";

import { getSheetData } from "@/lib/google/sheets";
import type { Exam } from "@/types/marks";

export async function getExams(facultyId?: string): Promise<Exam[]> {
    try {
        const sheetId = process.env.EXAMS_SHEET_ID;

        if (!sheetId) {
            console.error("EXAMS_SHEET_ID not configured");
            return [];
        }

        const data = await getSheetData(sheetId, "Exams!A:M");

        let exams = data.map((row) => ({
            examId: row.ExamId as string,
            examName: row.ExamName as string,
            examType: row.ExamType as any,
            subject: row.Subject as string,
            department: row.Department as string,
            semester: row.Semester as string,
            maxMarks: Number(row.MaxMarks),
            passingMarks: Number(row.PassingMarks),
            examDate: row.ExamDate as string,
            facultyId: row.FacultyId as string,
            facultyName: row.FacultyName as string,
            createdAt: row.CreatedAt as string,
            status: (row.Status as any) || "scheduled",
        }));

        // Filter by faculty if provided
        if (facultyId) {
            exams = exams.filter((exam) => exam.facultyId === facultyId);
        }

        // Sort by exam date (newest first)
        exams.sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());

        return exams;
    } catch (error) {
        console.error("Error fetching exams:", error);
        return [];
    }
}

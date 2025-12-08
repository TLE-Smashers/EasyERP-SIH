"use server";

import { appendSheetRow } from "@/lib/google/sheets";
import type { Exam, ExamType } from "@/types/marks";

export interface CreateExamInput {
    examName: string;
    examType: ExamType;
    subject: string;
    department: string;
    semester: string;
    maxMarks: number;
    passingMarks: number;
    examDate: string;
    facultyId: string;
    facultyName: string;
}

export async function createExam(input: CreateExamInput) {
    try {
        const sheetId = process.env.EXAMS_SHEET_ID;

        if (!sheetId) {
            return {
                success: false,
                message: "Exams sheet not configured",
            };
        }

        // Generate exam ID
        const examId = `EXM${Date.now()}`;
        const createdAt = new Date().toISOString();

        // Prepare row data
        const rowData = [
            examId,
            input.examName,
            input.examType,
            input.subject,
            input.department,
            input.semester,
            input.maxMarks.toString(),
            input.passingMarks.toString(),
            input.examDate,
            input.facultyId,
            input.facultyName,
            createdAt,
            "scheduled", // status
        ];

        // Append to sheet
        const result = await appendSheetRow(sheetId, "Exams!A:M", [rowData]);

        if (!result.success) {
            return {
                success: false,
                message: "Failed to create exam",
            };
        }

        return {
            success: true,
            message: "Exam created successfully",
            examId,
        };
    } catch (error) {
        console.error("Error creating exam:", error);
        return {
            success: false,
            message: "Failed to create exam",
        };
    }
}

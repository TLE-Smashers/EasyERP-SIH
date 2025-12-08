"use server";

import { appendSheetRow, getSheetData, updateSheetRow } from "@/lib/google/sheets";
import type { StudentMarks, GradeScale, MarksEntry } from "@/types/marks";

// Calculate grade based on percentage
function calculateGrade(percentage: number): GradeScale {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C+";
    if (percentage >= 40) return "C";
    if (percentage >= 33) return "D";
    return "F";
}

export interface EnterMarksInput {
    examId: string;
    examName: string;
    examType: string;
    subject: string;
    department: string;
    semester: string;
    maxMarks: number;
    facultyId: string;
    facultyName: string;
    marksEntries: MarksEntry[];
}

export async function enterMarks(input: EnterMarksInput) {
    try {
        const sheetId = process.env.MARKS_SHEET_ID;

        if (!sheetId) {
            return {
                success: false,
                message: "Marks sheet not configured",
            };
        }

        const timestamp = new Date().toISOString();
        const rows = [];

        for (const entry of input.marksEntries) {
            const marksId = `MRK${Date.now()}_${entry.studentId}`;
            const percentage = (entry.marksObtained / input.maxMarks) * 100;
            const grade = calculateGrade(percentage);

            const rowData = [
                marksId,
                input.examId,
                input.examName,
                input.examType,
                entry.studentId,
                entry.studentName,
                entry.studentEmail || "",
                entry.rollNumber,
                input.department,
                input.semester,
                input.subject,
                entry.marksObtained.toString(),
                input.maxMarks.toString(),
                percentage.toFixed(2),
                grade,
                entry.remarks || "",
                input.facultyId,
                input.facultyName,
                timestamp,
                timestamp, // updatedAt
            ];

            rows.push(rowData);
        }

        // Append all rows at once
        const result = await appendSheetRow(sheetId, "Marks!A:T", rows);

        if (!result.success) {
            return {
                success: false,
                message: "Failed to enter marks",
            };
        }

        return {
            success: true,
            message: `Marks entered successfully for ${input.marksEntries.length} students`,
        };
    } catch (error) {
        console.error("Error entering marks:", error);
        return {
            success: false,
            message: "Failed to enter marks",
        };
    }
}

export async function getStudentMarks(studentId?: string, examId?: string): Promise<StudentMarks[]> {
    try {
        const sheetId = process.env.MARKS_SHEET_ID;

        if (!sheetId) {
            console.error("MARKS_SHEET_ID not configured");
            return [];
        }

        const data = await getSheetData(sheetId, "Marks!A:T");

        let marks = data.map((row) => ({
            marksId: row.MarksId as string,
            examId: row.ExamId as string,
            examName: row.ExamName as string,
            examType: row.ExamType as any,
            studentId: row.StudentId as string,
            studentName: row.StudentName as string,
            studentEmail: row.StudentEmail as string,
            rollNumber: row.RollNumber as string,
            department: row.Department as string,
            semester: row.Semester as string,
            subject: row.Subject as string,
            marksObtained: Number(row.MarksObtained),
            maxMarks: Number(row.MaxMarks),
            percentage: Number(row.Percentage),
            grade: row.Grade as GradeScale,
            remarks: row.Remarks as string,
            facultyId: row.FacultyId as string,
            facultyName: row.FacultyName as string,
            enteredAt: row.EnteredAt as string,
            updatedAt: row.UpdatedAt as string,
        }));

        // Filter by student if provided
        if (studentId) {
            marks = marks.filter((mark) => mark.studentId === studentId);
        }

        // Filter by exam if provided
        if (examId) {
            marks = marks.filter((mark) => mark.examId === examId);
        }

        return marks;
    } catch (error) {
        console.error("Error fetching student marks:", error);
        return [];
    }
}

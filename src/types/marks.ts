/**
 * Marks and Examination Types
 * Handles student marks, exams, and grade management
 */

export type ExamType = 'mid_term' | 'end_term' | 'quiz' | 'assignment' | 'internal' | 'practical' | 'project';

export type GradeScale = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';

export interface Exam {
    examId: string;
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
    createdAt: string;
    status: 'scheduled' | 'completed' | 'cancelled';
}

export interface StudentMarks {
    marksId: string;
    examId: string;
    examName: string;
    examType: ExamType;
    studentId: string;
    studentName: string;
    studentEmail: string;
    rollNumber: string;
    department: string;
    semester: string;
    subject: string;
    marksObtained: number;
    maxMarks: number;
    percentage: number;
    grade: GradeScale;
    remarks?: string;
    facultyId: string;
    facultyName: string;
    enteredAt: string;
    updatedAt?: string;
}

export interface MarksEntry {
    studentId: string;
    studentName: string;
    rollNumber: string;
    studentEmail?: string;
    marksObtained: number;
    remarks?: string;
}

export interface ExamStats {
    totalStudents: number;
    studentsAppeared: number;
    studentsAbsent: number;
    averageMarks: number;
    highestMarks: number;
    lowestMarks: number;
    passCount: number;
    failCount: number;
    passPercentage: number;
}

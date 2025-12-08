"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getExams } from "@/actions/marks/getExams";
import { enterMarks } from "@/actions/marks/enterMarks";
import { getStudentMarks } from "@/actions/marks/enterMarks";
import type { Exam, MarksEntry } from "@/types/marks";

// Mock students data - In production, fetch from Google Sheets
const MOCK_STUDENTS = [
    { studentId: "STU001", studentName: "Rahul Kumar", rollNumber: "21CSE001", studentEmail: "rahul@example.com" },
    { studentId: "STU002", studentName: "Priya Singh", rollNumber: "21CSE002", studentEmail: "priya@example.com" },
    { studentId: "STU003", studentName: "Amit Sharma", rollNumber: "21CSE003", studentEmail: "amit@example.com" },
    { studentId: "STU004", studentName: "Sneha Patel", rollNumber: "21CSE004", studentEmail: "sneha@example.com" },
    { studentId: "STU005", studentName: "Vikram Reddy", rollNumber: "21CSE005", studentEmail: "vikram@example.com" },
];

export default function EnterMarksPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const examId = params.examId as string;

    const [exam, setExam] = React.useState<Exam | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [marksData, setMarksData] = React.useState<Record<string, MarksEntry>>({});
    const [existingMarks, setExistingMarks] = React.useState<Record<string, number>>({});

    React.useEffect(() => {
        loadExamDetails();
    }, [examId]);

    async function loadExamDetails() {
        setIsLoading(true);
        try {
            const exams = await getExams(session?.user?.email || "");
            const currentExam = exams.find((e) => e.examId === examId);

            if (!currentExam) {
                toast.error("Exam not found");
                router.push("/dashboard/faculty/marks");
                return;
            }

            setExam(currentExam);

            // Load existing marks if any
            const marks = await getStudentMarks(undefined, examId);
            const existingMarksMap: Record<string, number> = {};
            marks.forEach((mark) => {
                existingMarksMap[mark.studentId] = mark.marksObtained;
            });
            setExistingMarks(existingMarksMap);

            // Initialize marks data with existing marks
            const initialMarksData: Record<string, MarksEntry> = {};
            MOCK_STUDENTS.forEach((student) => {
                initialMarksData[student.studentId] = {
                    studentId: student.studentId,
                    studentName: student.studentName,
                    rollNumber: student.rollNumber,
                    marksObtained: existingMarksMap[student.studentId] || 0,
                    remarks: "",
                };
            });
            setMarksData(initialMarksData);
        } catch (error) {
            toast.error("Failed to load exam details");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    function handleMarksChange(studentId: string, value: string) {
        const marks = parseFloat(value) || 0;
        setMarksData((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                marksObtained: marks,
            },
        }));
    }

    function handleRemarksChange(studentId: string, value: string) {
        setMarksData((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                remarks: value,
            },
        }));
    }

    async function handleSaveMarks() {
        if (!exam) return;

        setIsSaving(true);
        try {
            // Filter students with marks entered
            const marksEntries = Object.values(marksData).filter(
                (entry) => entry.marksObtained > 0 || existingMarks[entry.studentId]
            );

            if (marksEntries.length === 0) {
                toast.error("Please enter marks for at least one student");
                setIsSaving(false);
                return;
            }

            // Validate marks
            const invalidMarks = marksEntries.filter(
                (entry) => entry.marksObtained > exam.maxMarks
            );
            if (invalidMarks.length > 0) {
                toast.error(`Marks cannot exceed maximum marks (${exam.maxMarks})`);
                setIsSaving(false);
                return;
            }

            const result = await enterMarks({
                examId: exam.examId,
                examName: exam.examName,
                examType: exam.examType,
                subject: exam.subject,
                department: exam.department,
                semester: exam.semester,
                maxMarks: exam.maxMarks,
                facultyId: session?.user?.email || "",
                facultyName: session?.user?.name || "",
                marksEntries,
            });

            if (result.success) {
                toast.success(result.message);
                router.push("/dashboard/faculty/marks");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to save marks");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading exam details...</p>
                </div>
            </div>
        );
    }

    if (!exam) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/dashboard/faculty/marks")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Exams
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">{exam.examName}</h1>
                    <div className="flex gap-2">
                        <Badge>{exam.examType.replace(/_/g, " ").toUpperCase()}</Badge>
                        <Badge variant="outline">{exam.subject}</Badge>
                        <Badge variant="outline">
                            {exam.department} - Sem {exam.semester}
                        </Badge>
                    </div>
                </div>
                <Button onClick={handleSaveMarks} disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Marks
                        </>
                    )}
                </Button>
            </div>

            {/* Exam Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Exam Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Maximum Marks:</span>
                            <span className="ml-2 font-semibold">{exam.maxMarks}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Passing Marks:</span>
                            <span className="ml-2 font-semibold">{exam.passingMarks}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Exam Date:</span>
                            <span className="ml-2 font-semibold">{exam.examDate}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Marks Entry Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Enter Student Marks</CardTitle>
                    <CardDescription>
                        Enter marks for each student. Marks will be automatically graded.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Roll Number</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Marks Obtained</TableHead>
                                <TableHead>Percentage</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {MOCK_STUDENTS.map((student) => {
                                const marks = marksData[student.studentId]?.marksObtained || 0;
                                const percentage = (marks / exam.maxMarks) * 100;
                                const grade =
                                    percentage >= 90
                                        ? "A+"
                                        : percentage >= 80
                                            ? "A"
                                            : percentage >= 70
                                                ? "B+"
                                                : percentage >= 60
                                                    ? "B"
                                                    : percentage >= 50
                                                        ? "C+"
                                                        : percentage >= 40
                                                            ? "C"
                                                            : percentage >= 33
                                                                ? "D"
                                                                : "F";

                                return (
                                    <TableRow key={student.studentId}>
                                        <TableCell className="font-medium">{student.rollNumber}</TableCell>
                                        <TableCell>{student.studentName}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="0"
                                                max={exam.maxMarks}
                                                value={marks || ""}
                                                onChange={(e) => handleMarksChange(student.studentId, e.target.value)}
                                                className="w-24"
                                                placeholder="0"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {marks > 0 ? `${percentage.toFixed(2)}%` : "-"}
                                        </TableCell>
                                        <TableCell>
                                            {marks > 0 ? (
                                                <Badge
                                                    className={
                                                        grade === "F"
                                                            ? "bg-red-500"
                                                            : grade.includes("A")
                                                                ? "bg-green-500"
                                                                : "bg-blue-500"
                                                    }
                                                >
                                                    {grade}
                                                </Badge>
                                            ) : (
                                                "-"
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="text"
                                                value={marksData[student.studentId]?.remarks || ""}
                                                onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
                                                placeholder="Optional"
                                                className="w-32"
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Save, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getFacultyByEmail } from "@/actions/faculty/getFaculty";
import { getStudentsByBranch } from "@/actions/faculty/getStudentsByBranch";
import { submitExamScores } from "@/actions/faculty/examScores";
import type { StudentRecord } from "@/lib/google/sheets.studentTable";
import type { ExamScoreInput } from "@/lib/google/sheets.examScores";

type ExamType = "Mid-1" | "Mid-2" | "End-Sem" | "Practical";

interface MarksEntry {
    studentId: string;
    marksObtained: string;
    remarks: string;
}

export default function FacultyMarksPage() {
    const { data: session } = useSession();
    const [facultyId, setFacultyId] = React.useState("");
    const [facultyName, setFacultyName] = React.useState("");
    const [facultyBranch, setFacultyBranch] = React.useState("");

    // Form state
    const [selectedYear, setSelectedYear] = React.useState("");
    const [selectedSemester, setSelectedSemester] = React.useState("");
    const [selectedExamType, setSelectedExamType] = React.useState<ExamType | "">("");
    const [subjectCode, setSubjectCode] = React.useState("");
    const [subjectName, setSubjectName] = React.useState("");
    const [maxMarks, setMaxMarks] = React.useState(0);

    // Students and marks
    const [students, setStudents] = React.useState<StudentRecord[]>([]);
    const [marksEntries, setMarksEntries] = React.useState<Record<string, MarksEntry>>({});
    const [isLoadingStudents, setIsLoadingStudents] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [showStudentList, setShowStudentList] = React.useState(false);

    React.useEffect(() => {
        if (session?.user?.email) {
            loadFacultyData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    // Update max marks when exam type changes
    React.useEffect(() => {
        if (selectedExamType === "Mid-1" || selectedExamType === "Mid-2") {
            setMaxMarks(20);
        } else if (selectedExamType === "End-Sem") {
            setMaxMarks(100);
        } else if (selectedExamType === "Practical") {
            setMaxMarks(50);
        }
    }, [selectedExamType]);

    async function loadFacultyData() {
        if (!session?.user?.email) return;

        try {
            const facultyData = await getFacultyByEmail(session.user.email);
            if (facultyData) {
                setFacultyId(facultyData.facultyId);
                setFacultyName(facultyData.fullName);
                setFacultyBranch(facultyData.branch);
            }
        } catch (error) {
            console.error("Error loading faculty data:", error);
            toast.error("Failed to load faculty data");
        }
    }

    async function handleLoadStudents() {
        if (!selectedYear || !selectedSemester || !selectedExamType) {
            toast.error("Please select year, semester, and exam type");
            return;
        }

        if (!subjectCode || !subjectName) {
            toast.error("Please enter subject code and name");
            return;
        }

        setIsLoadingStudents(true);
        try {
            const result = await getStudentsByBranch(facultyBranch, selectedYear);

            if (result.success) {
                // Filter by semester
                const filteredStudents = result.data.filter(
                    (s) => s.currentSemester === parseInt(selectedSemester)
                );

                if (filteredStudents.length === 0) {
                    toast.error(`No students found in Year ${selectedYear}, Semester ${selectedSemester}`);
                    setStudents([]);
                    setShowStudentList(false);
                    return;
                }

                setStudents(filteredStudents);

                // Initialize marks entries
                const entries: Record<string, MarksEntry> = {};
                filteredStudents.forEach((student) => {
                    entries[student.id] = {
                        studentId: student.id,
                        marksObtained: "",
                        remarks: "",
                    };
                });
                setMarksEntries(entries);
                setShowStudentList(true);
                toast.success(`Loaded ${filteredStudents.length} students`);
            } else {
                toast.error(result.message);
                setStudents([]);
                setShowStudentList(false);
            }
        } catch (error) {
            console.error("Error loading students:", error);
            toast.error("Failed to load students");
        } finally {
            setIsLoadingStudents(false);
        }
    }

    function handleMarksChange(studentId: string, marks: string) {
        const numMarks = parseFloat(marks);
        if (marks !== "" && (isNaN(numMarks) || numMarks < 0 || numMarks > maxMarks)) {
            toast.error(`Marks must be between 0 and ${maxMarks}`);
            return;
        }

        setMarksEntries((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                marksObtained: marks,
            },
        }));
    }

    function handleRemarksChange(studentId: string, remarks: string) {
        setMarksEntries((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                remarks,
            },
        }));
    }

    async function handleSubmit() {
        // Validate all entries have marks
        const emptyEntries = students.filter((s) => !marksEntries[s.id]?.marksObtained);
        if (emptyEntries.length > 0) {
            toast.error(`Please enter marks for all ${students.length} students`);
            return;
        }

        setIsSubmitting(true);
        try {
            const currentYear = new Date().getFullYear();
            const scores: ExamScoreInput[] = students.map((student) => ({
                studentId: student.id,
                enrollmentNumber: student.enrollmentNumber,
                studentName: student.fullName,
                course: student.course,
                branch: student.branch,
                currentYear: student.currentYear,
                currentSemester: student.currentSemester,
                subjectCode,
                subjectName,
                examType: selectedExamType as ExamType,
                maxMarks,
                marksObtained: parseFloat(marksEntries[student.id].marksObtained),
                remarks: marksEntries[student.id].remarks,
                facultyId,
                facultyName,
                academicYear: currentYear.toString(),
            }));

            const result = await submitExamScores(scores);

            if (result.success) {
                toast.success(result.message);
                // Reset form
                setShowStudentList(false);
                setStudents([]);
                setMarksEntries({});
                setSubjectCode("");
                setSubjectName("");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Error submitting scores:", error);
            toast.error("Failed to submit exam scores");
        } finally {
            setIsSubmitting(false);
        }
    }

    const filledCount = students.filter((s) => marksEntries[s.id]?.marksObtained).length;
    const progress = students.length > 0 ? (filledCount / students.length) * 100 : 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Enter Exam Marks</h1>
                <p className="text-muted-foreground">
                    Enter marks for students in your branch ({facultyBranch})
                </p>
            </div>

            {/* Configuration Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Exam Configuration</CardTitle>
                    <CardDescription>
                        Select exam details and subject information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="year">Year</Label>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger id="year">
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1st Year</SelectItem>
                                    <SelectItem value="2">2nd Year</SelectItem>
                                    <SelectItem value="3">3rd Year</SelectItem>
                                    <SelectItem value="4">4th Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="semester">Semester</Label>
                            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                                <SelectTrigger id="semester">
                                    <SelectValue placeholder="Select semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Semester 1</SelectItem>
                                    <SelectItem value="2">Semester 2</SelectItem>
                                    <SelectItem value="3">Semester 3</SelectItem>
                                    <SelectItem value="4">Semester 4</SelectItem>
                                    <SelectItem value="5">Semester 5</SelectItem>
                                    <SelectItem value="6">Semester 6</SelectItem>
                                    <SelectItem value="7">Semester 7</SelectItem>
                                    <SelectItem value="8">Semester 8</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="examType">Exam Type</Label>
                            <Select value={selectedExamType} onValueChange={(v) => setSelectedExamType(v as ExamType)}>
                                <SelectTrigger id="examType">
                                    <SelectValue placeholder="Select exam type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Mid-1">Mid-1 (20 marks)</SelectItem>
                                    <SelectItem value="Mid-2">Mid-2 (20 marks)</SelectItem>
                                    <SelectItem value="End-Sem">End-Sem (100 marks)</SelectItem>
                                    <SelectItem value="Practical">Practical (50 marks)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="subjectCode">Subject Code</Label>
                            <Input
                                id="subjectCode"
                                placeholder="e.g., IT201"
                                value={subjectCode}
                                onChange={(e) => setSubjectCode(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subjectName">Subject Name</Label>
                            <Input
                                id="subjectName"
                                placeholder="e.g., Data Structures"
                                value={subjectName}
                                onChange={(e) => setSubjectName(e.target.value)}
                            />
                        </div>
                    </div>

                    {selectedExamType && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Maximum marks for {selectedExamType}: <strong>{maxMarks}</strong>
                            </AlertDescription>
                        </Alert>
                    )}

                    <Button
                        onClick={handleLoadStudents}
                        disabled={isLoadingStudents || !selectedYear || !selectedSemester || !selectedExamType || !subjectCode || !subjectName}
                        className="w-full md:w-auto"
                    >
                        {isLoadingStudents ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading Students...
                            </>
                        ) : (
                            "Load Students"
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Marks Entry Table */}
            {showStudentList && students.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Enter Marks</CardTitle>
                                <CardDescription>
                                    {students.length} students • {filledCount} completed ({progress.toFixed(0)}%)
                                </CardDescription>
                            </div>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || filledCount < students.length}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Submit All Marks
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Enrollment No.</TableHead>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead className="w-32">Marks (/{maxMarks})</TableHead>
                                        <TableHead className="w-48">Remarks</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student, index) => {
                                        const entry = marksEntries[student.id];
                                        const isComplete = entry?.marksObtained !== "";

                                        return (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell>{student.enrollmentNumber}</TableCell>
                                                <TableCell>{student.fullName}</TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max={maxMarks}
                                                        step="0.5"
                                                        placeholder="0"
                                                        value={entry?.marksObtained || ""}
                                                        onChange={(e) => handleMarksChange(student.id, e.target.value)}
                                                        className={isComplete ? "border-green-500" : ""}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        placeholder="Optional"
                                                        value={entry?.remarks || ""}
                                                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {isComplete && (
                                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {filledCount < students.length && (
                            <Alert className="mt-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Please enter marks for all {students.length} students before submitting.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

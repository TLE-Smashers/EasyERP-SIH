"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Calendar, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AttendanceByGradeChart } from "@/components/dashboard/AttendanceByGradeChart";
import { AbsentStudentPercentageChart } from "@/components/dashboard/AbsentStudentPercentageChart";
import { AttendanceByDayChart } from "@/components/dashboard/AttendanceByDayChart";
import { SuspensionByGradeChart } from "@/components/dashboard/SuspensionByGradeChart";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getStudentsByBranch, getBranchFilters } from "@/actions/faculty/getStudentsByBranch";
import { saveStudentAttendance, checkAttendanceExists } from "@/actions/faculty/studentAttendanceActions";
import { getFacultyByEmail } from "@/actions/faculty/getFaculty";
import type { StudentRecord } from "@/lib/google/sheets.studentTable";

type AttendanceStudent = {
    studentId: string;
    name: string;
    rollNumber: string;
    semester: string;
    status: "present" | "absent";
};

export default function FacultyAttendancePage() {
    const { data: session } = useSession();
    const [selectedDate, setSelectedDate] = React.useState(
        new Date().toISOString().split("T")[0]
    );
    const [selectedYear, setSelectedYear] = React.useState("");
    const [selectedSection, setSelectedSection] = React.useState("");
    const [selectedSubject, setSelectedSubject] = React.useState("");
    const [students, setStudents] = React.useState<AttendanceStudent[]>([]);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [years, setYears] = React.useState<string[]>([]);
    const [sections, setSections] = React.useState<string[]>([]);
    const [facultyBranch, setFacultyBranch] = React.useState<string>("");
    const [facultyName, setFacultyName] = React.useState<string>("");

    React.useEffect(() => {
        loadFacultyData();
    }, [session]);

    React.useEffect(() => {
        if (selectedYear && facultyBranch) {
            loadStudents();
        }
    }, [selectedYear, selectedSection, facultyBranch]);

    async function loadFacultyData() {
        if (!session?.user?.email) return;

        try {
            const facultyData = await getFacultyByEmail(session.user.email);

            if (!facultyData) {
                toast.error("Faculty data not found");
                return;
            }

            const branch = facultyData.branch;
            setFacultyBranch(branch);
            setFacultyName(facultyData.fullName);

            // Load filters
            const filtersResult = await getBranchFilters(branch);
            if (filtersResult.success) {
                setYears(filtersResult.data.years);
                setSections(filtersResult.data.sections);
            }
        } catch (error) {
            console.error("Error loading faculty data:", error);
            toast.error("Failed to load faculty data");
        }
    }

    async function loadStudents() {
        setIsLoading(true);
        try {
            const result = await getStudentsByBranch(
                facultyBranch,
                selectedYear
            );

            if (result.success) {
                // Transform to attendance format with default "absent"
                const attendanceStudents: AttendanceStudent[] = result.data.map((student) => ({
                    studentId: student.id,
                    name: student.fullName,
                    rollNumber: student.enrollmentNumber || student.id,
                    semester: student.currentSemester.toString(),
                    status: "absent" as const, // Default to absent
                }));
                setStudents(attendanceStudents);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Error loading students:", error);
            toast.error("Failed to load students");
        } finally {
            setIsLoading(false);
        }
    }

    const handleToggleAttendance = (studentId: string) => {
        setStudents((prev) =>
            prev.map((student) =>
                student.studentId === studentId
                    ? { ...student, status: student.status === "present" ? "absent" : "present" }
                    : student
            )
        );
    };

    const handleMarkAll = (status: "present" | "absent") => {
        setStudents((prev) =>
            prev.map((student) => ({ ...student, status }))
        );
    };

    const handleSaveAttendance = async () => {
        if (!selectedYear || !selectedSubject) {
            toast.error("Please select year and subject");
            return;
        }

        if (!session?.user?.email) {
            toast.error("Session not found");
            return;
        }

        setIsSaving(true);
        try {
            // Check if attendance already exists
            const checkResult = await checkAttendanceExists(
                selectedDate,
                facultyBranch,
                selectedYear,
                selectedSubject,
                selectedSection || undefined
            );

            if (checkResult.exists) {
                toast.error("Attendance already marked for this class on this date");
                setIsSaving(false);
                return;
            }

            // Prepare attendance data
            const attendanceData = students.map((student) => ({
                date: selectedDate,
                studentId: student.studentId,
                studentName: student.name,
                rollNumber: student.rollNumber,
                branch: facultyBranch,
                year: selectedYear,
                semester: student.semester,
                subject: selectedSubject,
                status: student.status,
            }));

            const result = await saveStudentAttendance(
                attendanceData,
                session.user.email,
                facultyName
            );

            if (result.success) {
                toast.success(result.message);
                // Reset form
                setStudents([]);
                setSelectedYear("");
                setSelectedSection("");
                setSelectedSubject("");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Error saving attendance:", error);
            toast.error("Failed to save attendance");
        } finally {
            setIsSaving(false);
        }
    };

    const stats = {
        total: students.length,
        present: students.filter((s) => s.status === "present").length,
        absent: students.filter((s) => s.status === "absent").length,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Student Attendance</h1>
                <p className="text-muted-foreground">
                    Mark attendance for students in your branch ({facultyBranch})
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Absent</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Attendance Marking */}
            <Card>
                <CardHeader>
                    <CardTitle>Mark Attendance</CardTitle>
                    <CardDescription>Select date, class, and subject to mark attendance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filters */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                max={new Date().toISOString().split("T")[0]}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="year">Year *</Label>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger id="year" className="mt-2">
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year}>
                                            Year {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="subject">Subject *</Label>
                            <Input
                                id="subject"
                                placeholder="Enter subject name"
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="mt-2"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : students.length > 0 ? (
                        <>
                            {/* Bulk Actions */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMarkAll("present")}
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Check All (Present)
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMarkAll("absent")}
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Uncheck All (Absent)
                                </Button>
                            </div>

                            {/* Attendance Table */}
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">Present</TableHead>
                                            <TableHead>Roll Number</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map((student) => (
                                            <TableRow
                                                key={student.studentId}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => handleToggleAttendance(student.studentId)}
                                            >
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={student.status === "present"}
                                                        onCheckedChange={() => handleToggleAttendance(student.studentId)}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">{student.rollNumber}</TableCell>
                                                <TableCell>{student.name}</TableCell>
                                                <TableCell>
                                                    {student.status === "present" ? (
                                                        <Badge className="bg-green-500">Present</Badge>
                                                    ) : (
                                                        <Badge className="bg-red-500">Absent</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setStudents([]);
                                        setSelectedYear("");
                                        setSelectedSection("");
                                        setSelectedSubject("");
                                    }}
                                >
                                    Reset
                                </Button>
                                <Button onClick={handleSaveAttendance} disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Attendance"
                                    )}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            {selectedYear ? "No students found for the selected filters" : "Please select year to load students"}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Attendance Analysis Dashboard */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-2xl font-bold">Attendance Analysis Dashboard</h2>
                    <p className="text-sm text-muted-foreground">
                        Visual representation of student attendance analysis
                    </p>
                </div>

                {/* Charts Row 1 */}
                <div className="grid gap-4 md:grid-cols-2">
                    <AttendanceByGradeChart />
                    <AbsentStudentPercentageChart />
                </div>

                {/* Charts Row 2 */}
                <div className="grid gap-4 md:grid-cols-2">
                    <AttendanceByDayChart />
                    <SuspensionByGradeChart />
                </div>
            </div>
        </div>
    );
}

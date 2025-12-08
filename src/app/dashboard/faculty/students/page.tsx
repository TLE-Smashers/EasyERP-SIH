"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Search, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { getStudentsByBranch, getBranchFilters } from "@/actions/faculty/getStudentsByBranch";
import { getFacultyByEmail } from "@/actions/faculty/getFaculty";
import type { StudentRecord } from "@/lib/google/sheets.studentTable";

export default function FacultyStudentsPage() {
    const { data: session } = useSession();
    const [students, setStudents] = React.useState<StudentRecord[]>([]);
    const [filteredStudents, setFilteredStudents] = React.useState<StudentRecord[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedYear, setSelectedYear] = React.useState("all");
    const [selectedSection, setSelectedSection] = React.useState("all");
    const [years, setYears] = React.useState<string[]>([]);
    const [sections, setSections] = React.useState<string[]>([]);
    const [facultyBranch, setFacultyBranch] = React.useState<string>("");

    React.useEffect(() => {
        loadFacultyAndStudents();
    }, [session]);

    React.useEffect(() => {
        applyFilters();
    }, [students, searchQuery, selectedYear, selectedSection]);

    async function loadFacultyAndStudents() {
        if (!session?.user?.email) return;

        setIsLoading(true);
        try {
            // Get faculty details to find their branch
            const facultyData = await getFacultyByEmail(session.user.email);

            if (!facultyData) {
                toast.error("Faculty data not found");
                return;
            }

            const branch = facultyData.branch;
            setFacultyBranch(branch);

            // Get students and filters for this branch
            const [studentsResult, filtersResult] = await Promise.all([
                getStudentsByBranch(branch),
                getBranchFilters(branch),
            ]);

            if (studentsResult.success) {
                setStudents(studentsResult.data);
            } else {
                toast.error(studentsResult.message);
            }

            if (filtersResult.success) {
                setYears(filtersResult.data.years);
                setSections(filtersResult.data.sections);
            }
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Failed to load students");
        } finally {
            setIsLoading(false);
        }
    }

    function applyFilters() {
        let filtered = students;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (student) =>
                    student.fullName.toLowerCase().includes(query) ||
                    student.enrollmentNumber?.toLowerCase().includes(query) ||
                    student.id.toLowerCase().includes(query) ||
                    student.email.toLowerCase().includes(query)
            );
        }

        // Year filter
        if (selectedYear !== "all") {
            filtered = filtered.filter(
                (student) => student.currentYear.toString() === selectedYear
            );
        }

        // Section filter removed as it's not in the new structure

        setFilteredStudents(filtered);
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading students...</p>
                </div>
            </div>
        );
    }

    // Group students by year for stats
    const studentsByYear = students.reduce((acc, student) => {
        const year = student.currentYear?.toString() || "1";
        acc[year] = (acc[year] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
                <p className="text-muted-foreground">
                    View and manage students from {facultyBranch} branch
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{students.length}</div>
                        <p className="text-xs text-muted-foreground">In your branch</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Years</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{years.length}</div>
                        <p className="text-xs text-muted-foreground">Different year levels</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sections</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sections.length || "All"}</div>
                        <p className="text-xs text-muted-foreground">Active sections</p>
                    </CardContent>
                </Card>
            </div>

            {/* Students Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Student List</CardTitle>
                    <CardDescription>All active students in your branch</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filters */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>

                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Years</SelectItem>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        Year {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>


                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Enrollment Number</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Gender</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Year</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">
                                                {student.id}
                                            </TableCell>
                                            <TableCell>
                                                {student.enrollmentNumber || "N/A"}
                                            </TableCell>
                                            <TableCell>{student.fullName}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {student.email}
                                            </TableCell>
                                            <TableCell>{student.mobileNumber}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {student.gender}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {student.course}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    Year {student.currentYear}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            No students found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredStudents.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                            Showing {filteredStudents.length} of {students.length} students
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

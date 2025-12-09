"use client";

/**
 * Client-side Faculty Attendance View with Filtering
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ClipboardCheck } from "lucide-react";

import { AttendanceStatsCards } from "@/components/faculty/AttendanceStatsCards";
import { DailyAttendanceTable } from "@/components/faculty/DailyAttendanceTable";
import { AttendanceMarkingForm } from "@/components/faculty/AttendanceMarkingForm";
import { FacultyAttendanceRecord } from "@/types/attendance";

interface Stats {
    total: number;
    present: number;
    absent: number;
    late: number;
    onLeave: number;
    halfDay: number;
    wfh: number;
}

interface FacultyAttendanceViewProps {
    stats: Stats;
    records: FacultyAttendanceRecord[];
    date: string;
}

export type FilterType = "all" | "present" | "absent" | "late" | "leave";

export function FacultyAttendanceView({ stats, records, date }: FacultyAttendanceViewProps) {
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");

    // Filter records based on active filter
    const filteredRecords = records.filter((record) => {
        if (activeFilter === "all") return true;
        if (activeFilter === "present") return record.status === "present";
        if (activeFilter === "absent") return record.status === "absent";
        if (activeFilter === "late") return record.status === "late" || record.status === "half_day";
        if (activeFilter === "leave") return record.status === "on_leave" || record.status === "work_from_home";
        return true;
    });

    // Mock faculty list - in real app, fetch from database
    const facultyList = [
        { email: "faculty1@example.com", name: "Dr. John Doe", employeeId: "FAC001", department: "CS" },
        { email: "faculty2@example.com", name: "Dr. Jane Smith", employeeId: "FAC002", department: "IT" },
    ];

    return (
        <div className="container mx-auto px-4 py-6 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
                <p className="text-muted-foreground mt-1">
                    Mark and manage daily faculty attendance
                </p>
            </div>

            {/* Statistics with Filtering */}
            <AttendanceStatsCards 
                stats={stats} 
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />

            {/* Main Content */}
            <Tabs defaultValue="mark" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="mark">
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        Mark Attendance
                    </TabsTrigger>
                    <TabsTrigger value="view">
                        <Calendar className="mr-2 h-4 w-4" />
                        View Records
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="mark" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mark Attendance</CardTitle>
                            <CardDescription>
                                Mark attendance for today or select a specific date
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AttendanceMarkingForm facultyList={facultyList} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="view" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Records</CardTitle>
                            <CardDescription>
                                {activeFilter === "all" 
                                    ? `Viewing all ${records.length} attendance records`
                                    : `Showing ${filteredRecords.length} of ${records.length} records (${activeFilter})`
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DailyAttendanceTable 
                                records={filteredRecords} 
                                date={date}
                                activeFilter={activeFilter}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

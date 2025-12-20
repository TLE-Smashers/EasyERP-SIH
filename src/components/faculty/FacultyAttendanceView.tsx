"use client";

/**
 * Client-side Faculty Attendance View with Filtering
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { AttendanceStatsCards } from "@/components/faculty/AttendanceStatsCards";
import { DailyAttendanceTable } from "@/components/faculty/DailyAttendanceTable";
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

    return (
        <div className="space-y-8 w-full">
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
        </div>
    );
}

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MonthlyAttendanceSummary as MonthlySummary } from "@/types/attendance";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";

interface MonthlyAttendanceSummaryProps {
    summary: MonthlySummary;
}

export function MonthlyAttendanceSummary({ summary }: MonthlyAttendanceSummaryProps) {
    const attendancePercentage = summary.totalWorkingDays > 0
        ? ((summary.presentDays / summary.totalWorkingDays) * 100)
        : 0;

    const isGoodAttendance = attendancePercentage >= 90;
    const isAverageAttendance = attendancePercentage >= 75 && attendancePercentage < 90;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Monthly Summary
                </CardTitle>
                <CardDescription>
                    {summary.month}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Attendance Percentage */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Attendance</span>
                        <span className="text-2xl font-bold">
                            {attendancePercentage.toFixed(1)}%
                        </span>
                    </div>
                    <Progress
                        value={attendancePercentage}
                        className="h-3"
                        indicatorClassName={
                            isGoodAttendance
                                ? "bg-green-500"
                                : isAverageAttendance
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                        }
                    />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {isGoodAttendance ? (
                            <>
                                <TrendingUp className="h-3 w-3 text-green-600" />
                                <span className="text-green-600">Excellent attendance</span>
                            </>
                        ) : isAverageAttendance ? (
                            <>
                                <TrendingDown className="h-3 w-3 text-yellow-600" />
                                <span className="text-yellow-600">Average attendance</span>
                            </>
                        ) : (
                            <>
                                <TrendingDown className="h-3 w-3 text-red-600" />
                                <span className="text-red-600">Below average</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Total Days</p>
                        <p className="text-2xl font-bold">{summary.totalWorkingDays}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Present</p>
                        <p className="text-2xl font-bold text-green-600">{summary.presentDays}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Absent</p>
                        <p className="text-2xl font-bold text-red-600">{summary.absentDays}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Late</p>
                        <p className="text-2xl font-bold text-orange-600">{summary.lateDays}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Half Days</p>
                        <p className="text-2xl font-bold text-yellow-600">{summary.halfDays}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">On Leave</p>
                        <p className="text-2xl font-bold text-blue-600">{summary.leaveDays}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">WFH</p>
                        <p className="text-2xl font-bold text-purple-600">{summary.wfhDays}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Late Days</p>
                        <p className="text-2xl font-bold text-orange-600">{summary.lateDays}</p>
                    </div>
                </div>

                {/* Details */}
                <div className="pt-4 border-t space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Effective Present Days</span>
                        <span className="font-medium">
                            {summary.presentDays + (summary.halfDays * 0.5)} days
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Attendance Rate</span>
                        <span className="font-medium">
                            {attendancePercentage.toFixed(2)}%
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

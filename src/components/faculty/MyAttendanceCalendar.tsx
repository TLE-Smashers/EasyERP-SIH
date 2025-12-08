"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { FacultyAttendanceRecord, AttendanceStatus } from "@/types/attendance";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

interface MyAttendanceCalendarProps {
    records: FacultyAttendanceRecord[];
    currentMonth: Date;
}

export function MyAttendanceCalendar({ records, currentMonth }: MyAttendanceCalendarProps) {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = monthStart.getDay();

    const getStatusColor = (status: AttendanceStatus) => {
        const colors: Record<AttendanceStatus, string> = {
            "present": "bg-green-500 dark:bg-green-600",
            "absent": "bg-red-500 dark:bg-red-600",
            "half_day": "bg-yellow-500 dark:bg-yellow-600",
            "late": "bg-orange-500 dark:bg-orange-600",
            "on_leave": "bg-blue-500 dark:bg-blue-600",
            "work_from_home": "bg-purple-500 dark:bg-purple-600",
        };
        return colors[status];
    };

    const getAttendanceForDate = (date: Date) => {
        return records.find(record =>
            isSameDay(new Date(record.date), date)
        );
    };

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Attendance Calendar
                </CardTitle>
                <CardDescription>
                    {format(currentMonth, "MMMM yyyy")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Calendar Grid */}
                <div className="space-y-4">
                    {/* Week day headers */}
                    <div className="grid grid-cols-7 gap-2">
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-2">
                        {/* Empty cells for days before month starts */}
                        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
                            <div key={`empty-${index}`} className="aspect-square" />
                        ))}

                        {/* Actual days */}
                        {daysInMonth.map(day => {
                            const attendance = getAttendanceForDate(day);
                            const isToday = isSameDay(day, new Date());

                            return (
                                <div
                                    key={day.toString()}
                                    className={cn(
                                        "aspect-square p-2 rounded-lg border transition-all",
                                        "flex flex-col items-center justify-center relative",
                                        "bg-card hover:bg-accent/50",
                                        isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                                        !attendance && "bg-muted/30 dark:bg-muted/10"
                                    )}
                                >
                                    <span className={cn(
                                        "text-sm font-medium",
                                        isToday && "text-primary font-bold",
                                        !attendance && "text-muted-foreground"
                                    )}>
                                        {format(day, "d")}
                                    </span>
                                    {attendance && (
                                        <div
                                            className={cn(
                                                "w-2 h-2 rounded-full mt-1 shadow-sm",
                                                getStatusColor(attendance.status)
                                            )}
                                            title={attendance.status.replace(/_/g, " ").toUpperCase()}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="pt-4 border-t mt-4">
                        <h4 className="text-sm font-semibold mb-3">Status Legend</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                { status: "present" as AttendanceStatus, label: "Present" },
                                { status: "absent" as AttendanceStatus, label: "Absent" },
                                { status: "half_day" as AttendanceStatus, label: "Half Day" },
                                { status: "late" as AttendanceStatus, label: "Late" },
                                { status: "on_leave" as AttendanceStatus, label: "On Leave" },
                                { status: "work_from_home" as AttendanceStatus, label: "Work From Home" },
                            ].map(({ status, label }) => (
                                <div key={status} className="flex items-center gap-2 p-2 rounded-md bg-muted/50 dark:bg-muted/20">
                                    <div className={cn("w-3 h-3 rounded-full shadow-sm", getStatusColor(status))} />
                                    <span className="text-xs font-medium">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

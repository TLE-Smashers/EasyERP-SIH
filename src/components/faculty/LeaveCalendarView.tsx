"use client";

import { useState } from "react";
import { LeaveRequest } from "@/types/leave";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeaveCalendarViewProps {
    leaves: LeaveRequest[];
}

export function LeaveCalendarView({ leaves }: LeaveCalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    // Get leaves for the current month
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    // Find leaves that fall on a specific date
    const getLeavesForDate = (date: Date) => {
        return leaves.filter((leave) => {
            try {
                const leaveStart = parseISO(leave.startDate);
                const leaveEnd = parseISO(leave.endDate);
                return isWithinInterval(date, { start: leaveStart, end: leaveEnd });
            } catch {
                return false;
            }
        });
    };

    // Get leaves for selected date
    const selectedLeaves = selectedDate ? getLeavesForDate(selectedDate) : [];

    // Get all dates with leaves in current month
    const datesWithLeaves = new Set<string>();
    leaves.forEach((leave) => {
        try {
            const leaveStart = parseISO(leave.startDate);
            const leaveEnd = parseISO(leave.endDate);

            let currentDay = leaveStart;
            while (currentDay <= leaveEnd) {
                if (isWithinInterval(currentDay, { start: monthStart, end: monthEnd })) {
                    datesWithLeaves.add(format(currentDay, "yyyy-MM-dd"));
                }
                currentDay = new Date(currentDay.setDate(currentDay.getDate() + 1));
            }
        } catch {
            // Skip invalid dates
        }
    });

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(new Date());
    };

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {/* Calendar */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{format(currentDate, "MMMM yyyy")}</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={goToToday}>
                                Today
                            </Button>
                            <Button variant="outline" size="sm" onClick={goToNextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <CardDescription>
                        Click on a date to view leave details. Highlighted dates have approved leaves.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            month={currentDate}
                            onMonthChange={setCurrentDate}
                            className="rounded-md border p-3"
                            classNames={{
                                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                month: "space-y-4",
                                caption: "flex justify-center pt-1 relative items-center",
                                caption_label: "text-sm font-medium",
                                nav: "space-x-1 flex items-center",
                                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                                nav_button_previous: "absolute left-1",
                                nav_button_next: "absolute right-1",
                                table: "w-full border-collapse space-y-1",
                                head_row: "flex",
                                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                                row: "flex w-full mt-2",
                                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                                day_range_end: "day-range-end",
                                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                day_today: "bg-accent text-accent-foreground",
                                day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                                day_disabled: "text-muted-foreground opacity-50",
                                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                day_hidden: "invisible",
                            }}
                            modifiers={{
                                hasLeave: (date) => datesWithLeaves.has(format(date, "yyyy-MM-dd")),
                            }}
                            modifiersClassNames={{
                                hasLeave: "bg-green-100 font-bold text-green-900 hover:bg-green-200",
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Leave Details */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Select a Date"}
                    </CardTitle>
                    <CardDescription>
                        {selectedDate
                            ? selectedLeaves.length > 0
                                ? `${selectedLeaves.length} faculty member(s) on leave`
                                : "No leaves on this date"
                            : "Click on a date to view details"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {selectedDate && selectedLeaves.length > 0 ? (
                        <div className="space-y-4">
                            {selectedLeaves.map((leave) => (
                                <div
                                    key={leave.id}
                                    className="rounded-lg border p-4 space-y-2"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium">{leave.facultyName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {leave.employeeId} • {leave.department}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="capitalize">
                                            {leave.leaveType}
                                        </Badge>
                                    </div>
                                    <div className="text-sm">
                                        <p className="text-muted-foreground">
                                            {format(parseISO(leave.startDate), "MMM dd")} -{" "}
                                            {format(parseISO(leave.endDate), "MMM dd, yyyy")}
                                        </p>
                                        <p className="text-muted-foreground">
                                            {leave.totalDays} day(s) • {leave.duration.replace("_", " ")}
                                        </p>
                                    </div>
                                    {leave.reason && (
                                        <div className="text-sm">
                                            <p className="font-medium">Reason:</p>
                                            <p className="text-muted-foreground">{leave.reason}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            {selectedDate
                                ? "No faculty members on leave"
                                : "Select a date to view leave details"}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

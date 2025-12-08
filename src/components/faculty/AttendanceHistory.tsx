"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FacultyAttendanceRecord, AttendanceStatus } from "@/types/attendance";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Clock, Calendar, FileText } from "lucide-react";

interface AttendanceHistoryProps {
    records: FacultyAttendanceRecord[];
}

export function AttendanceHistory({ records }: AttendanceHistoryProps) {
    const [filterStatus, setFilterStatus] = useState<AttendanceStatus | "All">("All");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const getStatusBadge = (status: AttendanceStatus) => {
        const variants: Record<AttendanceStatus, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
            "present": { variant: "default", className: "bg-green-600" },
            "absent": { variant: "destructive" },
            "half_day": { variant: "secondary" },
            "late": { variant: "secondary", className: "bg-yellow-600 text-white" },
            "on_leave": { variant: "outline" },
            "work_from_home": { variant: "secondary", className: "bg-blue-600 text-white" },
        };

        const config = variants[status];
        return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
    };

    // Filter records
    const filteredRecords = filterStatus === "All"
        ? records
        : records.filter(r => r.status === filterStatus);

    // Sort records
    const sortedRecords = [...filteredRecords].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    // Calculate stats for filtered records
    const stats = {
        total: filteredRecords.length,
        present: filteredRecords.filter(r => r.status === "present").length,
        absent: filteredRecords.filter(r => r.status === "absent").length,
        late: filteredRecords.filter(r => r.status === "late").length,
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Attendance History
                </CardTitle>
                <CardDescription>
                    {sortedRecords.length} record(s) found
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <Select
                            value={filterStatus}
                            onValueChange={(value) => setFilterStatus(value as AttendanceStatus | "All")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Status</SelectItem>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                                <SelectItem value="half_day">Half Day</SelectItem>
                                <SelectItem value="late">Late</SelectItem>
                                <SelectItem value="on_leave">On Leave</SelectItem>
                                <SelectItem value="work_from_home">Work From Home</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1">
                        <Select
                            value={sortOrder}
                            onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="desc">Newest First</SelectItem>
                                <SelectItem value="asc">Oldest First</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Quick Stats */}
                {filterStatus === "All" && (
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                            <div className="text-xs text-muted-foreground">Present</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                            <div className="text-xs text-muted-foreground">Absent</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{stats.late}</div>
                            <div className="text-xs text-muted-foreground">Late</div>
                        </div>
                    </div>
                )}

                {/* Records Table */}
                {sortedRecords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No records found</h3>
                        <p className="text-sm text-muted-foreground">
                            {filterStatus === "All"
                                ? "No attendance records available"
                                : `No ${filterStatus} records found`}
                        </p>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Check In</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedRecords.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {format(new Date(record.date), "MMM dd, yyyy")}
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                                        <TableCell>
                                            {record.checkInTime ? (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                    {record.checkInTime}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{record.method}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground max-w-[300px] truncate block">
                                                {record.remarks || "-"}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

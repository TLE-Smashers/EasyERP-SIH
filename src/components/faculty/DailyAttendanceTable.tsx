"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FacultyAttendanceRecord, AttendanceStatus } from "@/types/attendance";
import { format } from "date-fns";
import { Edit2, Loader2, Users, Clock } from "lucide-react";
import { updateAttendanceRecord } from "@/actions/faculty/attendanceActions";
import { toast } from "sonner";

interface DailyAttendanceTableProps {
    records: FacultyAttendanceRecord[];
    date: string;
}

export function DailyAttendanceTable({ records, date }: DailyAttendanceTableProps) {
    const router = useRouter();
    const [editingRecord, setEditingRecord] = useState<FacultyAttendanceRecord | null>(null);
    const [newStatus, setNewStatus] = useState<AttendanceStatus>("present");
    const [isUpdating, setIsUpdating] = useState(false);

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

    const handleEdit = (record: FacultyAttendanceRecord) => {
        setEditingRecord(record);
        setNewStatus(record.status);
    };

    const handleUpdate = async () => {
        if (!editingRecord) return;

        setIsUpdating(true);
        try {
            const result = await updateAttendanceRecord(editingRecord.id, { status: newStatus });

            if (result.success) {
                toast.success(`Status updated to ${newStatus} for ${editingRecord.facultyName}`);
                setEditingRecord(null);
                router.refresh();
            } else {
                toast.error(result.message || "Failed to update attendance");
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsUpdating(false);
        }
    };

    if (records.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Daily Attendance</CardTitle>
                    <CardDescription>
                        Attendance for {format(new Date(date), "MMMM dd, yyyy")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No attendance records</h3>
                        <p className="text-sm text-muted-foreground">
                            No attendance has been marked for this date yet
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Daily Attendance</CardTitle>
                    <CardDescription>
                        {records.length} faculty member(s) · {format(new Date(date), "MMMM dd, yyyy")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Faculty Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Check In</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Remarks</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">
                                            {record.facultyName}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {record.facultyId}
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
                                            <span className="text-sm text-muted-foreground max-w-[200px] truncate block">
                                                {record.remarks || "-"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEdit(record)}
                                            >
                                                <Edit2 className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Attendance</DialogTitle>
                        <DialogDescription>
                            Update attendance status for {editingRecord?.facultyName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Faculty</Label>
                            <div className="text-sm">
                                <div className="font-medium">{editingRecord?.facultyName}</div>
                                <div className="text-muted-foreground">{editingRecord?.facultyId}</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <div className="text-sm text-muted-foreground">
                                {editingRecord && format(new Date(editingRecord.date), "PPP")}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newStatus">New Status *</Label>
                            <Select
                                value={newStatus}
                                onValueChange={(value) => setNewStatus(value as AttendanceStatus)}
                            >
                                <SelectTrigger id="newStatus">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="present">Present</SelectItem>
                                    <SelectItem value="absent">Absent</SelectItem>
                                    <SelectItem value="half_day">Half Day</SelectItem>
                                    <SelectItem value="late">Late</SelectItem>
                                    <SelectItem value="on_leave">On Leave</SelectItem>
                                    <SelectItem value="work_from_home">Work From Home</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingRecord(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={isUpdating}>
                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Attendance
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

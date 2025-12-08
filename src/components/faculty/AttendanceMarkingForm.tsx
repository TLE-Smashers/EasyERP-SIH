"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AttendanceStatus } from "@/types/attendance";
import { recordBulkAttendance } from "@/actions/faculty/attendanceActions";
import { toast } from "sonner";
import { Loader2, Users } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface FacultyOption {
    email: string;
    name: string;
    employeeId?: string;
    department?: string;
}

interface AttendanceMarkingFormProps {
    facultyList: FacultyOption[];
    onSuccess?: () => void;
}

export function AttendanceMarkingForm({ facultyList, onSuccess }: AttendanceMarkingFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>("present");
    const [selectedFaculty, setSelectedFaculty] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            setSelectedFaculty(facultyList.map(f => f.email));
        } else {
            setSelectedFaculty([]);
        }
    };

    const handleFacultyToggle = (email: string, checked: boolean) => {
        if (checked) {
            setSelectedFaculty([...selectedFaculty, email]);
        } else {
            setSelectedFaculty(selectedFaculty.filter(e => e !== email));
            setSelectAll(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedFaculty.length === 0) {
            toast.error("Please select at least one faculty member");
            return;
        }

        setIsSubmitting(true);
        try {
            // Bulk marking
            const entries = selectedFaculty.map(email => {
                const faculty = facultyList.find(f => f.email === email);
                return {
                    facultyId: email, // Using email as facultyId for now
                    facultyName: faculty?.name || "Unknown",
                    employeeId: faculty?.employeeId || "EMP000",
                    department: faculty?.department || "Unknown",
                    status: selectedStatus,
                };
            });

            const result = await recordBulkAttendance(entries, date, "Admin"); // markedBy should come from session

            if (result.success) {
                toast.success(`Attendance marked as ${selectedStatus} for ${selectedFaculty.length} faculty members`);
            } else {
                throw new Error(result.message);
            }

            // Reset form
            setSelectedFaculty([]);
            setSelectAll(false);
            onSuccess?.();
            router.refresh();
        } catch (error) {
            console.error("Attendance marking error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to mark attendance");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Mark Attendance
                </CardTitle>
                <CardDescription>Record attendance for faculty members</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Date Selection */}
                    <div className="space-y-2">
                        <Label>Attendance Date *</Label>
                        <input
                            type="date"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    {/* Status Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Attendance Status *</Label>
                        <Select
                            value={selectedStatus}
                            onValueChange={(value) => setSelectedStatus(value as AttendanceStatus)}
                        >
                            <SelectTrigger id="status">
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

                    {/* Faculty Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Select Faculty Members *</Label>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="selectAll"
                                    checked={selectAll}
                                    onCheckedChange={handleSelectAll}
                                />
                                <label
                                    htmlFor="selectAll"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Select All ({facultyList.length})
                                </label>
                            </div>
                        </div>

                        <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto space-y-2">
                            {facultyList.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No faculty members found
                                </p>
                            ) : (
                                facultyList.map((faculty) => (
                                    <div key={faculty.email} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={faculty.email}
                                            checked={selectedFaculty.includes(faculty.email)}
                                            onCheckedChange={(checked) =>
                                                handleFacultyToggle(faculty.email, checked as boolean)
                                            }
                                        />
                                        <label
                                            htmlFor={faculty.email}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                                        >
                                            <div className="flex flex-col">
                                                <span>{faculty.name}</span>
                                                <span className="text-xs text-muted-foreground">{faculty.email}</span>
                                            </div>
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>

                        {selectedFaculty.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                                {selectedFaculty.length} faculty member(s) selected
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting
                            ? "Marking Attendance..."
                            : `Mark Attendance for ${selectedFaculty.length || 0} Faculty`}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

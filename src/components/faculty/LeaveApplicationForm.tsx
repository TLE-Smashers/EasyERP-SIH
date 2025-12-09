"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { submitLeaveRequest } from "@/actions/faculty/leaveActions";
import { LeaveType, LeaveDuration, LeaveFormData } from "@/types/leave";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { differenceInCalendarDays } from "date-fns";

interface LeaveApplicationFormProps {
    facultyId: string;
    facultyName: string;
    facultyEmail: string;
    employeeId: string;
    department: string;
    onSuccess?: () => void;
}

export function LeaveApplicationForm({
    facultyId,
    facultyName,
    facultyEmail,
    employeeId,
    department,
    onSuccess
}: LeaveApplicationFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        leaveType: "" as LeaveType,
        duration: "full_day" as LeaveDuration,
        startDate: "",
        endDate: "",
        reason: "",
    });

    const calculateDays = () => {
        if (!formData.startDate || !formData.endDate) return 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const days = differenceInCalendarDays(end, start) + 1;
        if (formData.duration === "half_day_first" || formData.duration === "half_day_second") return 0.5;
        return Math.max(days, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason.trim()) {
            toast.error("Please fill all required fields");
            return;
        }

        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);

        if (end < start) {
            toast.error("End date cannot be before start date");
            return;
        }

        setIsSubmitting(true);
        try {
            const leaveFormData: LeaveFormData = {
                leaveType: formData.leaveType,
                startDate: formData.startDate,
                endDate: formData.endDate,
                duration: formData.duration,
                reason: formData.reason,
            };

            const result = await submitLeaveRequest(
                facultyId,
                facultyName,
                employeeId,
                department,
                leaveFormData
            );

            if (result.success) {
                toast.success(`Your ${formData.leaveType} leave request has been submitted successfully`);
                // Reset form
                setFormData({
                    leaveType: "" as LeaveType,
                    duration: "full_day",
                    startDate: "",
                    endDate: "",
                    reason: "",
                });
                onSuccess?.();
                router.refresh();
            } else {
                toast.error(result.message || "Failed to submit leave request");
            }
        } catch (error) {
            console.error("Leave submission error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalDays = calculateDays();

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Leave Type */}
            <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type *</Label>
                <Select
                    value={formData.leaveType}
                    onValueChange={(value) =>
                        setFormData({ ...formData, leaveType: value as LeaveType })
                    }
                >
                    <SelectTrigger id="leaveType">
                        <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="casual">Casual Leave</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="earned">Earned Leave</SelectItem>
                        <SelectItem value="maternity">Maternity Leave</SelectItem>
                        <SelectItem value="paternity">Paternity Leave</SelectItem>
                        <SelectItem value="compensatory">Compensatory Off</SelectItem>
                        <SelectItem value="unpaid">Leave Without Pay</SelectItem>
                        <SelectItem value="other">Special Leave</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Select
                    value={formData.duration}
                    onValueChange={(value) =>
                        setFormData({ ...formData, duration: value as LeaveDuration })
                    }
                >
                    <SelectTrigger id="duration">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="full_day">Full Day</SelectItem>
                        <SelectItem value="half_day_first">Half Day (First Half)</SelectItem>
                        <SelectItem value="half_day_second">Half Day (Second Half)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <input
                        id="startDate"
                        type="date"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <input
                        id="endDate"
                        type="date"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                        required
                    />
                </div>
            </div>

            {/* Calculated Days */}
            {totalDays > 0 && (
                <div className="rounded-md bg-muted p-3 text-sm">
                    <span className="font-medium">Total Days: </span>
                    <span className="text-muted-foreground">{totalDays} day(s)</span>
                </div>
            )}

            {/* Reason */}
            <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                    id="reason"
                    placeholder="Enter reason for leave..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={4}
                    className="resize-none"
                />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Submitting..." : "Submit Leave Request"}
            </Button>
        </form>
    );
}

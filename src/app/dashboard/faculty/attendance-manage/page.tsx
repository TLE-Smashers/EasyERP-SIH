/**
 * Admin Attendance Management Page
 * Mark and manage faculty attendance
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

import { getDailyAttendanceStats, getAttendanceByDate } from "@/actions/faculty/attendanceActions";
import { FacultyAttendanceView } from "@/components/faculty/FacultyAttendanceView";

export const metadata: Metadata = {
    title: "Faculty Attendance | Admin",
    description: "View and manage faculty attendance",
};

export default async function AttendanceManagePage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
        redirect("/login");
    }

    const today = new Date().toISOString().split("T")[0];

    // Fetch attendance stats
    const statsResult = await getDailyAttendanceStats(today);
    const rawStats = statsResult.success ? statsResult.data : null;
    const stats = rawStats ? {
        total: rawStats.totalMarked || 0,
        present: rawStats.present || 0,
        absent: rawStats.absent || 0,
        late: rawStats.late || 0,
        onLeave: rawStats.onLeave || 0,
        halfDay: rawStats.halfDay || 0,
        wfh: rawStats.wfh || 0,
    } : { total: 0, present: 0, absent: 0, late: 0, onLeave: 0, halfDay: 0, wfh: 0 };

    // Fetch daily attendance records
    const recordsResult = await getAttendanceByDate(today);
    const records = recordsResult.success ? recordsResult.data : [];

    return (
        <FacultyAttendanceView 
            stats={stats} 
            records={records} 
            date={today}
        />
    );
}

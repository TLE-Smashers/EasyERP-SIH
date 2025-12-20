/**
 * Admin Leave Calendar Page
 * Visual calendar view of all faculty leaves
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

import { PageHeader } from "@/components/ui/page-header";
import { LeaveCalendarView } from "@/components/faculty/LeaveCalendarView";
import { getLeaveRequests } from "@/actions/faculty/leaveActions";

export const metadata: Metadata = {
    title: "Leave Calendar | Admin",
    description: "Calendar view of all faculty leaves",
};

export default async function LeaveCalendarPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
        redirect("/login");
    }

    // Fetch all approved leave requests
    const requestsResult = await getLeaveRequests();
    const allRequests = requestsResult.success ? requestsResult.data : [];
    const approvedLeaves = (allRequests || []).filter(req => req.status === "approved");

    return (
        <div className="container mx-auto px-4 py-6 space-y-8">
            <PageHeader
                title="Leave Calendar"
                description="Visual calendar view of all approved faculty leaves"
            />

            <LeaveCalendarView leaves={approvedLeaves} />
        </div>
    );
}

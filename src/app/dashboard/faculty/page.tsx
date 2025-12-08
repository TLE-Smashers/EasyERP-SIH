"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, Users, UserCheck, UserX, Calendar, ClipboardList, BookOpen, FileText, GraduationCap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { WeeklyAttendanceHeatmap } from "@/components/dashboard/WeeklyAttendanceHeatmap";
import { PerformanceTrendChart } from "@/components/dashboard/PerformanceTrendChart";
import { FacultyTable } from "@/components/faculty/FacultyTable";
import { FacultyDrawer } from "@/components/faculty/FacultyDrawer";
import { getFaculty, getFacultyStats } from "@/actions/faculty/getFaculty";
import { changeFacultyStatus } from "@/actions/faculty/changeFacultyStatus";
import type { Faculty } from "@/actions/faculty/getFaculty";
import type { FacultyStats } from "@/types/faculty";
import JobReferralNotices from "@/components/job-referral-notices";

export default function FacultyPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [faculty, setFaculty] = React.useState<Faculty[]>([]);
    const [stats, setStats] = React.useState<FacultyStats | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [selectedFacultyId, setSelectedFacultyId] = React.useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = React.useState(false);

    // Check if user is faculty member or admin
    const isFacultyMember = session?.user?.role === 'faculty';
    const isAdmin = session?.user?.role === 'admin';

    React.useEffect(() => {
        // Only load faculty list data if user is admin
        if (isAdmin) {
            loadData();
        } else {
            setIsLoading(false);
        }
    }, [isAdmin]);

    async function loadData() {
        setIsLoading(true);
        try {
            const [facultyData, statsData] = await Promise.all([
                getFaculty(),
                getFacultyStats(),
            ]);
            console.log("[Faculty Page] Loaded faculty count:", facultyData.length);
            if (facultyData.length > 0) {
                console.log("[Faculty Page] First faculty sample:", {
                    id: facultyData[0].id,
                    facultyId: facultyData[0].facultyId,
                    name: facultyData[0].name
                });
            }
            setFaculty(facultyData);
            setStats(statsData);
        } catch (error) {
            toast.error("Failed to load faculty data");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    function handleViewDetails(id: string) {
        setSelectedFacultyId(id);
        setDrawerOpen(true);
    }

    function handleEdit(id: string) {
        console.log("[Faculty Page] Edit clicked for ID:", id);
        router.push(`/dashboard/faculty/edit/${id}`);
    }

    async function handleChangeStatus(id: string, status: "active" | "on_leave" | "inactive") {
        try {
            const result = await changeFacultyStatus(id, status, "admin");
            if (result.success) {
                toast.success(result.message);
                loadData();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to update faculty status");
            console.error(error);
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Faculty Member Dashboard View
    if (isFacultyMember) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Faculty Dashboard"
                    description={`Welcome back, ${session?.user?.name}!`}
                />

                {/* Quick Actions */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => router.push("/dashboard/faculty/profile")}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">My Profile</CardTitle>
                            <Users className="h-6 w-6 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                View and update your information
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-md transition-shadow border-2 border-primary/20 bg-primary/5"
                        onClick={() => router.push("/faculty/attendance")}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">📸 Mark My Attendance</CardTitle>
                            <UserCheck className="h-6 w-6 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium text-primary">
                                Check-in/out with photo + GPS
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => router.push("/dashboard/faculty/my-attendance")}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">My Attendance</CardTitle>
                            <Calendar className="h-6 w-6 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                View your attendance history
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => router.push("/dashboard/faculty/leave")}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">Leave Requests</CardTitle>
                            <ClipboardList className="h-6 w-6 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Apply and manage leave
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => router.push("/dashboard/faculty/classes")}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">My Classes</CardTitle>
                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                View your class schedule
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Quick Links */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Access</CardTitle>
                        <CardDescription>Frequently used features</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        <Button
                            variant="default"
                            className="h-auto py-4 justify-start bg-primary"
                            onClick={() => router.push("/faculty/attendance")}
                        >
                            <div className="flex items-center gap-3">
                                <UserCheck className="h-5 w-5" />
                                <div className="text-left">
                                    <div className="font-medium">📸 Mark My Attendance</div>
                                    <div className="text-xs opacity-90">Photo + GPS check-in/out</div>
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-auto py-4 justify-start"
                            onClick={() => router.push("/dashboard/faculty/attendance")}
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5" />
                                <div className="text-left">
                                    <div className="font-medium">Mark Student Attendance</div>
                                    <div className="text-xs text-muted-foreground">Take attendance for your classes</div>
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-auto py-4 justify-start"
                            onClick={() => router.push("/dashboard/faculty/marks")}
                        >
                            <div className="flex items-center gap-3">
                                <GraduationCap className="h-5 w-5" />
                                <div className="text-left">
                                    <div className="font-medium">Enter Student Marks</div>
                                    <div className="text-xs text-muted-foreground">Create exams and enter marks</div>
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-auto py-4 justify-start"
                            onClick={() => router.push("/dashboard/faculty/students")}
                        >
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5" />
                                <div className="text-left">
                                    <div className="font-medium">View Students</div>
                                    <div className="text-xs text-muted-foreground">See your class students</div>
                                </div>
                            </div>
                        </Button>
                    </CardContent>
                </Card>

                {/* Analytics Dashboard */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold">Analytics & Insights</h2>
                        <p className="text-sm text-muted-foreground">
                            Track attendance patterns and student performance trends
                        </p>
                    </div>

                    {/* Charts */}
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                        <WeeklyAttendanceHeatmap />
                        <PerformanceTrendChart />
                    </div>
                </div>
            </div>
        );
    }

    // Admin Dashboard View (existing code)
    return (
        <div className="space-y-6">
            <PageHeader
                title="Faculty Management"
                description="Manage faculty members and their information"
                actions={
                    <Button onClick={() => router.push("/dashboard/faculty/new")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Faculty
                    </Button>
                }
            />

            {/* Stats Cards */}
            {stats && (
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">Total Faculty</CardTitle>
                            <Users className="h-6 w-6 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="pb-4">
                            <div className="text-3xl font-bold">{stats.totalFaculty}</div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Across all departments
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">Active</CardTitle>
                            <UserCheck className="h-6 w-6 text-green-500" />
                        </CardHeader>
                        <CardContent className="pb-4">
                            <div className="text-3xl font-bold">{stats.activeCount}</div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Currently working
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">On Leave</CardTitle>
                            <UserX className="h-6 w-6 text-yellow-500" />
                        </CardHeader>
                        <CardContent className="pb-4">
                            <div className="text-3xl font-bold">{stats.onLeaveCount}</div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Currently unavailable
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Department-wise Distribution */}
            {stats && stats.departmentWise.length > 0 && (
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Department-wise Distribution</CardTitle>
                        <CardDescription>Faculty count by department</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-4">
                            {stats.departmentWise.map((dept) => (
                                <div key={dept.department} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                                    <div>
                                        <p className="font-medium">{dept.department}</p>
                                        <p className="text-2xl font-bold">{dept.count}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Alumni Job Referrals Section */}
            <JobReferralNotices maxDisplay={3} showHeader={true} />

            {/* Faculty Table */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>All Faculty Members</CardTitle>
                    <CardDescription>
                        Complete list of faculty members with filters
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FacultyTable
                        data={faculty}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEdit}
                        onChangeStatus={handleChangeStatus}
                    />
                </CardContent>
            </Card>

            {/* Faculty Details Drawer */}
            <FacultyDrawer
                facultyId={selectedFacultyId}
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
            />
        </div>
    );
}

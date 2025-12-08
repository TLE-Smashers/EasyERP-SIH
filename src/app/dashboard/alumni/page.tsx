"use client";

import { useEffect, useState } from "react";
import {
    Award,
    Briefcase,
    Calendar,
    GraduationCap,
    Mail,
    MapPin,
    Phone,
    TrendingUp,
    Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { getAlumniByEmail, getAlumniStats, type AlumniRecord } from "@/actions/alumni/getAlumni";
import { toast } from "sonner";

export default function AlumniDashboardPage() {
    const { data: session } = useSession();
    const [alumni, setAlumni] = useState<AlumniRecord | null>(null);
    const [stats, setStats] = useState<{
        total: number;
        byBranch: { branch: string; count: number }[];
        byBatch: { batch: string; count: number }[];
    }>({ total: 0, byBranch: [], byBatch: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            if (!session?.user?.email) {
                setIsLoading(false);
                return;
            }

            try {
                const [alumniData, statsData] = await Promise.all([
                    getAlumniByEmail(session.user.email),
                    getAlumniStats(),
                ]);

                if (alumniData) {
                    setAlumni(alumniData);
                } else {
                    toast.error("Alumni profile not found");
                }

                setStats(statsData);
            } catch (error) {
                console.error("Error loading alumni data:", error);
                toast.error("Failed to load alumni data");
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, [session?.user?.email]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                </div>
            </div>
        );
    }

    if (!alumni) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-muted-foreground">Alumni profile not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <Card className="border-none bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-4 border-white">
                            <AvatarImage src={alumni.photoUrl} alt={alumni.fullName} />
                            <AvatarFallback className="bg-white text-blue-600 text-2xl font-bold">
                                {alumni.fullName
                                    ?.split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .toUpperCase() || "AL"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold">
                                Welcome Back, {alumni.fullName || "Alumni"}!
                            </h1>
                            <p className="mt-1 text-blue-100">
                                Alumni Portal - Stay connected with your alma mater
                            </p>
                            <Badge className="mt-2 bg-white text-blue-600 hover:bg-white/90">
                                <GraduationCap className="mr-1 h-3 w-3" />
                                Class of {alumni.batch?.split("-")[1] || "Graduate"}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Alumni Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Graduation Year</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {alumni.batch?.split("-")[1] || "N/A"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {alumni.course} - {alumni.branch}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alumni Network</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}+</div>
                        <p className="text-xs text-muted-foreground">
                            Active alumni members
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Events</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">
                            Upcoming alumni events
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {alumni.admissionYear || "4"}Y
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Years at institution
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Profile Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Academic Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Award className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Degree Obtained</p>
                                    <p className="text-sm text-muted-foreground">
                                        {alumni.course} in {alumni.branch}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Batch</p>
                                    <p className="text-sm text-muted-foreground">
                                        {alumni.batch || "N/A"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Student ID</p>
                                    <p className="text-sm text-muted-foreground">
                                        {alumni.id || "N/A"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Enrollment Number</p>
                                    <p className="text-sm text-muted-foreground">
                                        {alumni.enrollmentNumber || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-sm text-muted-foreground">
                                        {alumni.email || "N/A"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Phone</p>
                                    <p className="text-sm text-muted-foreground">
                                        {alumni.mobileNumber || "N/A"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Category</p>
                                    <p className="text-sm text-muted-foreground">
                                        {alumni.category || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

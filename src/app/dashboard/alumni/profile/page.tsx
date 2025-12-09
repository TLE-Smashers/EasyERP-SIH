"use client";

import { useEffect, useState } from "react";
import {
    Mail,
    Phone,
    MapPin,
    Calendar,
    GraduationCap,
    User,
    Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { formatDate } from "@/lib/utils/dateFormat";
import { getAlumniByEmail, type AlumniRecord } from "@/actions/alumni/getAlumni";
import { toast } from "sonner";

export default function AlumniProfilePage() {
    const { data: session } = useSession();
    const [alumni, setAlumni] = useState<AlumniRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadAlumniData() {
            if (!session?.user?.email) {
                setIsLoading(false);
                return;
            }

            try {
                const data = await getAlumniByEmail(session.user.email);
                if (data) {
                    setAlumni(data);
                } else {
                    toast.error("Alumni profile not found");
                }
            } catch (error) {
                console.error("Error loading alumni data:", error);
                toast.error("Failed to load alumni profile");
            } finally {
                setIsLoading(false);
            }
        }

        loadAlumniData();
    }, [session?.user?.email]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-48 w-full" />
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
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

    const getInitials = (name?: string) => {
        if (!name) return "AL";
        return name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
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
            {/* Profile Header */}
            <Card className="border-none bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <CardHeader className="pb-3">
                    <div className="flex items-start gap-6">
                        <Avatar className="h-24 w-24 border-4 border-border">
                            <AvatarImage src={alumni.photoUrl} alt={alumni.fullName} />
                            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                {getInitials(alumni.fullName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold">
                                        {alumni.fullName || "Alumni User"}
                                    </h1>
                                    <p className="mt-1 text-blue-100">
                                        {alumni.course} in {alumni.branch}
                                    </p>
                                    <div className="mt-2 flex gap-2">
                                        <Badge variant="secondary" className="gap-1 bg-white text-blue-600">
                                            <GraduationCap className="h-3 w-3" />
                                            Alumni
                                        </Badge>
                                        <Badge variant="outline" className="border-white text-white">
                                            Class of {alumni.batch?.split("-")[1] || "N/A"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Profile Information Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <InfoRow
                            icon={Mail}
                            label="Email Address"
                            value={alumni.email || "N/A"}
                        />
                        <InfoRow
                            icon={Phone}
                            label="Mobile Number"
                            value={alumni.mobileNumber || "N/A"}
                        />
                        <InfoRow
                            icon={Calendar}
                            label="Date of Birth"
                            value={formatDate(alumni.dateOfBirth, "long")}
                        />
                        <InfoRow
                            icon={User}
                            label="Gender"
                            value={alumni.gender || "N/A"}
                        />
                    </CardContent>
                </Card>

                {/* Academic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Academic Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <InfoRow
                            icon={GraduationCap}
                            label="Student ID"
                            value={alumni.id || "N/A"}
                        />
                        <InfoRow
                            icon={GraduationCap}
                            label="Enrollment Number"
                            value={alumni.enrollmentNumber || "N/A"}
                        />
                        <InfoRow
                            icon={GraduationCap}
                            label="Course"
                            value={alumni.course || "N/A"}
                        />
                        <InfoRow
                            icon={GraduationCap}
                            label="Branch"
                            value={alumni.branch || "N/A"}
                        />
                        <InfoRow
                            icon={Calendar}
                            label="Batch"
                            value={alumni.batch || "N/A"}
                        />
                        <InfoRow
                            icon={Calendar}
                            label="Admission Date"
                            value={formatDate(alumni.admissionDate, "long")}
                        />
                        <InfoRow
                            icon={GraduationCap}
                            label="Admission Year"
                            value={alumni.admissionYear?.toString() || "N/A"}
                        />
                    </CardContent>
                </Card>

                {/* Contact & Guardian Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Additional Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <InfoRow
                            icon={User}
                            label="Guardian Name"
                            value={alumni.guardianName || "N/A"}
                        />
                        <InfoRow
                            icon={User}
                            label="Category"
                            value={alumni.category || "N/A"}
                        />
                    </CardContent>
                </Card>

                {/* Professional Information (Placeholder) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Professional Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-dashed p-6 text-center">
                            <Briefcase className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="mt-2 text-sm font-medium">
                                Update your professional details
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Share your current employment and career achievements
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

interface InfoRowProps {
    icon: React.ElementType;
    label: string;
    value: string;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="text-sm break-words">{value}</p>
            </div>
        </div>
    );
}



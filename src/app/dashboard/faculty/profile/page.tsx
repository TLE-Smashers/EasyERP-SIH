"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Mail, Phone, Calendar, MapPin, Briefcase, GraduationCap, User, BookOpen, Users } from "lucide-react";
import { toast } from "sonner";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFacultyByEmail } from "@/actions/faculty/getFaculty";
import type { Faculty } from "@/types/faculty";

export default function FacultyProfilePage() {
    const { data: session } = useSession();
    const [faculty, setFaculty] = React.useState<Faculty | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        if (session?.user?.email) {
            loadProfile();
        }
    }, [session]);

    async function loadProfile() {
        if (!session?.user?.email) return;

        setIsLoading(true);
        try {
            const data = await getFacultyByEmail(session.user.email);
            if (data) {
                setFaculty(data);
            } else {
                toast.error("Faculty profile not found");
            }
        } catch (error) {
            toast.error("Failed to load profile");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    const getStatusColor = (status: string) => {
        const normalizedStatus = status?.toLowerCase() || 'active';
        switch (normalizedStatus) {
            case "active":
                return "bg-green-500";
            case "on_leave":
                return "bg-yellow-500";
            case "inactive":
                return "bg-gray-500";
            default:
                return "bg-gray-500";
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!faculty) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                    <p className="text-muted-foreground">
                        View and manage your personal information
                    </p>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            Profile information not available. Please contact administration.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground">
                    View and manage your personal information
                </p>
            </div>

            {/* Header Card with Photo */}
            <Card>
                <CardHeader>
                    <div className="flex items-start gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={faculty.photoUrl} alt={faculty.fullName} />
                            <AvatarFallback className="text-2xl">
                                {getInitials(faculty.fullName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl">{faculty.fullName}</CardTitle>
                                    <CardDescription className="mt-2 text-base">
                                        {faculty.designation} • {faculty.branch}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`h-3 w-3 rounded-full ${getStatusColor(faculty.status)}`} />
                                    <span className="text-sm font-medium capitalize">{faculty.status.replace(/_/g, " ")}</span>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Faculty ID:</span>
                                    <span>{faculty.facultyId}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{faculty.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{faculty.mobileNumber}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

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
                        <div>
                            <label className="text-sm text-muted-foreground">Full Name</label>
                            <p className="font-medium">{faculty.fullName}</p>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Date of Birth</label>
                            <p className="font-medium">{new Date(faculty.dateOfBirth).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Gender</label>
                            <p className="font-medium capitalize">{faculty.gender}</p>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Contact Number</label>
                            <p className="font-medium">{faculty.mobileNumber}</p>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Email Address</label>
                            <p className="font-medium">{faculty.email}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Professional Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Professional Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm text-muted-foreground">Faculty ID</label>
                            <p className="font-medium">{faculty.facultyId}</p>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Designation</label>
                            <p className="font-medium">{faculty.designation}</p>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Department/Branch</label>
                            <p className="font-medium">{faculty.branch}</p>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Date of Joining</label>
                            <p className="font-medium">{new Date(faculty.joiningDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Status</label>
                            <Badge variant={faculty.status.toLowerCase() === 'active' ? 'default' : 'secondary'}>
                                {faculty.status}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Information (if exists in your sheet) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Academic Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm text-muted-foreground">Department</label>
                            <p className="font-medium">{faculty.branch}</p>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Assigned Subjects</label>
                            <p className="font-medium">{faculty.assignedSubjects || 'Not assigned'}</p>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Assigned Classes</label>
                            <p className="font-medium">{faculty.assignedClasses || 'Not assigned'}</p>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Access Role</label>
                            <p className="font-medium capitalize">{faculty.accessRole}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

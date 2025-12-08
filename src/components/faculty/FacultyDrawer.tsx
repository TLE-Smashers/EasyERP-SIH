"use client";

import * as React from "react";
import { X, Mail, Phone, Calendar, User, Building, Briefcase, BookOpen, Shield, Activity } from "lucide-react";
import { Faculty } from "@/types/faculty";
import { fetchFaculty } from "@/actions/faculty/fetchFaculty";
import { toast } from "sonner";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface FacultyDrawerProps {
    facultyId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function FacultyDrawer({ facultyId, open, onOpenChange }: FacultyDrawerProps) {
    const [faculty, setFaculty] = React.useState<Faculty | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        if (facultyId && open) {
            loadFaculty();
        }
    }, [facultyId, open]);

    async function loadFaculty() {
        if (!facultyId) return;

        setIsLoading(true);
        try {
            const data = await fetchFaculty(facultyId);
            setFaculty(data);
        } catch (error) {
            toast.error("Failed to load faculty details");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
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

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Faculty Details</SheetTitle>
                    <SheetDescription>
                        Complete information about faculty member
                    </SheetDescription>
                </SheetHeader>

                {isLoading ? (
                    <div className="space-y-4 mt-6">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : faculty ? (
                    <div className="space-y-6 mt-6">
                        {/* Header Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-2xl">{faculty.fullName}</CardTitle>
                                        <CardDescription className="mt-2">
                                            {faculty.designation} • {faculty.branch}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-3 w-3 rounded-full ${getStatusColor(faculty.status)}`} />
                                        <span className="text-sm font-medium capitalize">{faculty.status.replace(/_/g, " ")}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-muted-foreground" />
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
                            </CardContent>
                        </Card>

                        {/* Personal & Professional Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        Date of Birth
                                    </label>
                                    <p className="font-medium mt-1">
                                        {faculty.dateOfBirth ? new Date(faculty.dateOfBirth).toLocaleDateString() : '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Activity className="h-3 w-3" />
                                        Gender
                                    </label>
                                    <p className="font-medium mt-1 capitalize">{faculty.gender}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Briefcase className="h-3 w-3" />
                                        Designation
                                    </label>
                                    <p className="font-medium mt-1">{faculty.designation}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Building className="h-3 w-3" />
                                        Department
                                    </label>
                                    <p className="font-medium mt-1">{faculty.branch}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        Joining Date
                                    </label>
                                    <p className="font-medium mt-1">
                                        {faculty.joiningDate ? new Date(faculty.joiningDate).toLocaleDateString() : '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Shield className="h-3 w-3" />
                                        Access Role
                                    </label>
                                    <p className="font-medium mt-1 capitalize">{faculty.accessRole}</p>
                                </div>
                                {faculty.assignedSubjects && (
                                    <div className="col-span-2">
                                        <label className="text-sm text-muted-foreground flex items-center gap-2">
                                            <BookOpen className="h-3 w-3" />
                                            Assigned Subjects
                                        </label>
                                        <p className="font-medium mt-1">{faculty.assignedSubjects}</p>
                                    </div>
                                )}
                                {faculty.assignedClasses && (
                                    <div className="col-span-2">
                                        <label className="text-sm text-muted-foreground flex items-center gap-2">
                                            <BookOpen className="h-3 w-3" />
                                            Assigned Classes
                                        </label>
                                        <p className="font-medium mt-1">{faculty.assignedClasses}</p>
                                    </div>
                                )}
                                {faculty.photoUrl && (
                                    <div className="col-span-2">
                                        <label className="text-sm text-muted-foreground">Photo</label>
                                        <div className="mt-2">
                                            <img
                                                src={faculty.photoUrl}
                                                alt={faculty.fullName}
                                                className="h-32 w-32 object-cover rounded-lg border"
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">No faculty data found</p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

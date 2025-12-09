"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FacultyForm, FacultyFormValues } from "@/components/faculty/FacultyForm";
import { fetchFaculty } from "@/actions/faculty/fetchFaculty";
import { updateFaculty } from "@/actions/faculty/updateFaculty";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditFacultyPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const unwrappedParams = React.use(params);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isFetching, setIsFetching] = React.useState(true);
    const [facultyData, setFacultyData] = React.useState<FacultyFormValues | null>(null);

    React.useEffect(() => {
        loadFaculty();
    }, [unwrappedParams.id]);

    async function loadFaculty() {
        setIsFetching(true);
        try {
            const faculty = await fetchFaculty(unwrappedParams.id);
            if (faculty) {
                setFacultyData({
                    facultyId: faculty.facultyId,
                    fullName: faculty.fullName,
                    email: faculty.email,
                    mobileNumber: faculty.mobileNumber,
                    gender: faculty.gender,
                    dateOfBirth: faculty.dateOfBirth,
                    photoUrl: faculty.photoUrl || "",
                    designation: faculty.designation,
                    branch: faculty.branch,
                    joiningDate: faculty.joiningDate,
                    assignedSubjects: faculty.assignedSubjects || "",
                    assignedClasses: faculty.assignedClasses || "",
                    accessRole: faculty.accessRole,
                    status: faculty.status,
                });
            } else {
                toast.error("Faculty not found");
                router.push("/dashboard/faculty");
            }
        } catch (error) {
            toast.error("Failed to load faculty data");
            console.error(error);
        } finally {
            setIsFetching(false);
        }
    }

    async function handleSubmit(data: FacultyFormValues) {
        setIsLoading(true);
        try {
            const result = await updateFaculty(unwrappedParams.id, data);

            if (result.success) {
                toast.success(result.message);
                // Navigate immediately without waiting for refresh
                router.push("/dashboard/faculty");
            } else {
                toast.error(result.message);
                setIsLoading(false);
            }
        } catch (error) {
            toast.error("Failed to update faculty member");
            console.error(error);
            setIsLoading(false);
        }
    }

    if (isFetching) {
        return (
            <div className="container mx-auto px-4 py-6 space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="space-y-1">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                </div>
                <Skeleton className="h-[600px] w-full" />
            </div>
        );
    }

    if (!facultyData) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-6 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Edit Faculty</h1>
                    <p className="text-muted-foreground">
                        Update the faculty member's information
                    </p>
                </div>
            </div>

            {/* Form */}
            <FacultyForm
                defaultValues={facultyData}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                currentFacultyId={unwrappedParams.id}
            />
        </div>
    );
}

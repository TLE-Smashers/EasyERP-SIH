"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { forwardRef, useImperativeHandle, useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

// Simplified schema matching actual Faculty sheet structure
const facultyFormSchema = z.object({
    // Basic Details (matching actual Faculty sheet)
    facultyId: z.string().min(1, "Faculty ID is required"),
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    mobileNumber: z.string().min(10, "Phone must be at least 10 digits"),
    gender: z.enum(["male", "female", "other"]),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    photoUrl: z.string().url().optional().or(z.literal("")),

    // Professional Details
    designation: z.string().min(1, "Designation is required"),
    branch: z.string().min(1, "Department/Branch is required"),
    joiningDate: z.string().min(1, "Date of joining is required"),

    // Optional Fields
    assignedSubjects: z.string().optional(),
    assignedClasses: z.string().optional(),
    accessRole: z.string().optional(),
    status: z.enum(["active", "inactive", "on_leave"]).default("active"),
});

export type FacultyFormValues = z.infer<typeof facultyFormSchema>;

interface FacultyFormProps {
    defaultValues?: Partial<FacultyFormValues>;
    onSubmit: (data: FacultyFormValues) => Promise<void>;
    onSaveAndAddAnother?: (data: FacultyFormValues) => Promise<void>;
    isLoading?: boolean;
    currentFacultyId?: string; // For edit mode - exclude this ID from duplicate checks
}

export interface FacultyFormRef {
    reset: () => void;
}

export const FacultyForm = forwardRef<FacultyFormRef, FacultyFormProps>(function FacultyForm(
    { defaultValues, onSubmit, onSaveAndAddAnother, isLoading, currentFacultyId },
    ref
) {
    const [checkingFacultyId, setCheckingFacultyId] = useState(false);
    const [facultyIdExists, setFacultyIdExists] = useState(false);
    const [checkingDuplicate, setCheckingDuplicate] = useState(false);
    const [duplicateExists, setDuplicateExists] = useState(false);
    const [duplicateInfo, setDuplicateInfo] = useState<string>("");

    const form = useForm({
        resolver: zodResolver(facultyFormSchema),
        defaultValues: {
            facultyId: "",
            fullName: "",
            email: "",
            mobileNumber: "",
            gender: "male",
            dateOfBirth: "",
            photoUrl: "",
            designation: "Assistant Professor",
            branch: "",
            joiningDate: "",
            assignedSubjects: "",
            assignedClasses: "",
            accessRole: "faculty",
            status: "active",
            ...defaultValues,
        },
    });

    // Watch faculty ID field for changes
    const facultyId = form.watch("facultyId");
    const fullName = form.watch("fullName");
    const email = form.watch("email");
    const mobileNumber = form.watch("mobileNumber");

    // Check if faculty ID exists (with debouncing)
    useEffect(() => {
        if (!facultyId || facultyId.trim() === "") {
            setFacultyIdExists(false);
            return;
        }

        // Skip check if this is the current faculty being edited
        if (currentFacultyId && facultyId === currentFacultyId) {
            setFacultyIdExists(false);
            form.clearErrors("facultyId");
            return;
        }

        const timeoutId = setTimeout(async () => {
            setCheckingFacultyId(true);
            try {
                const response = await fetch(`/api/faculty/check-id?id=${encodeURIComponent(facultyId)}`);
                const data = await response.json();
                setFacultyIdExists(data.exists);

                if (data.exists) {
                    form.setError("facultyId", {
                        type: "manual",
                        message: `Faculty ID "${facultyId}" already exists. Please use a different ID.`,
                    });
                } else {
                    form.clearErrors("facultyId");
                }
            } catch (error) {
                console.error("Error checking faculty ID:", error);
            } finally {
                setCheckingFacultyId(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [facultyId, form, currentFacultyId]);

    // Check for duplicate faculty data (name + email + mobile)
    useEffect(() => {
        if (!fullName || !email || !mobileNumber ||
            fullName.trim() === "" || email.trim() === "" || mobileNumber.trim() === "") {
            setDuplicateExists(false);
            setDuplicateInfo("");
            return;
        }

        const timeoutId = setTimeout(async () => {
            setCheckingDuplicate(true);
            try {
                const params = new URLSearchParams({
                    name: fullName,
                    email: email,
                    mobile: mobileNumber,
                });

                // Add excludeId parameter for edit mode
                if (currentFacultyId) {
                    params.append('excludeId', currentFacultyId);
                }

                const response = await fetch(`/api/faculty/check-id?${params.toString()}`);
                const data = await response.json();

                if (data.exists && data.faculty) {
                    setDuplicateExists(true);
                    setDuplicateInfo(`A faculty member with these details already exists (${data.faculty.facultyId})`);

                    // Set errors on all three fields
                    const errorMessage = `Duplicate found: ${data.faculty.facultyId}`;
                    form.setError("fullName", { type: "manual", message: errorMessage });
                    form.setError("email", { type: "manual", message: errorMessage });
                    form.setError("mobileNumber", { type: "manual", message: errorMessage });
                } else {
                    setDuplicateExists(false);
                    setDuplicateInfo("");
                    // Clear only duplicate-related errors, keep validation errors
                    const errors = form.formState.errors;
                    if (errors.fullName?.message?.includes("Duplicate found")) {
                        form.clearErrors("fullName");
                    }
                    if (errors.email?.message?.includes("Duplicate found")) {
                        form.clearErrors("email");
                    }
                    if (errors.mobileNumber?.message?.includes("Duplicate found")) {
                        form.clearErrors("mobileNumber");
                    }
                }
            } catch (error) {
                console.error("Error checking duplicate faculty:", error);
            } finally {
                setCheckingDuplicate(false);
            }
        }, 800); // 800ms debounce (slightly longer as we check 3 fields)

        return () => clearTimeout(timeoutId);
    }, [fullName, email, mobileNumber, form, currentFacultyId]);

    useImperativeHandle(ref, () => ({
        reset: () => {
            // Clear all form errors first
            form.clearErrors();

            // Reset form to default values
            form.reset({
                facultyId: "",
                fullName: "",
                email: "",
                mobileNumber: "",
                gender: "male",
                dateOfBirth: "",
                photoUrl: "",
                designation: "Assistant Professor",
                branch: "",
                joiningDate: "",
                assignedSubjects: "",
                assignedClasses: "",
                accessRole: "faculty",
                status: "active",
            });

            // Clear all validation states
            setDuplicateExists(false);
            setDuplicateInfo("");
            setFacultyIdExists(false);
            setCheckingFacultyId(false);
            setCheckingDuplicate(false);
        },
    }));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Duplicate Warning Banner */}
                {duplicateExists && duplicateInfo && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="shrink-0">
                                <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-red-800">Duplicate Faculty Detected</h3>
                                <p className="mt-1 text-sm text-red-700">{duplicateInfo}. Please verify the details before proceeding.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Essential faculty details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="facultyId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Faculty ID *</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input placeholder="FAC001" {...field} />
                                                {checkingFacultyId && (
                                                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                                                        Checking...
                                                    </span>
                                                )}
                                                {!checkingFacultyId && facultyId && !facultyIdExists && (
                                                    <span className="absolute right-3 top-2.5 text-xs text-green-600">
                                                        ✓ Available
                                                    </span>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormDescription>Unique identifier for the faculty</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Dr. John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email *</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="john.doe@university.edu" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="mobileNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mobile Number *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="9876543210" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gender *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dateOfBirth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date of Birth *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="photoUrl"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Photo URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://drive.google.com/..." {...field} />
                                        </FormControl>
                                        <FormDescription>Google Drive link or public image URL (optional)</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Professional Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Professional Information</CardTitle>
                        <CardDescription>Work-related details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="designation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Designation *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Assistant Professor" {...field} />
                                        </FormControl>
                                        <FormDescription>e.g., Professor, Assistant Professor, Lecturer</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="branch"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department/Branch *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Computer Science" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="joiningDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date of Joining *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="on_leave">On Leave</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="assignedSubjects"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Assigned Subjects</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Data Structures, Algorithms, Database Systems" {...field} />
                                        </FormControl>
                                        <FormDescription>Comma-separated list of subjects</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="assignedClasses"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Assigned Classes</FormLabel>
                                        <FormControl>
                                            <Input placeholder="CSE-A, CSE-B, IT-A" {...field} />
                                        </FormControl>
                                        <FormDescription>Comma-separated list of class sections</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="accessRole"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Access Role</FormLabel>
                                        <FormControl>
                                            <Input placeholder="faculty" {...field} />
                                        </FormControl>
                                        <FormDescription>System access role (default: faculty)</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
                        Cancel
                    </Button>
                    {onSaveAndAddAnother && (
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={isLoading}
                            onClick={form.handleSubmit(onSaveAndAddAnother)}
                        >
                            {isLoading ? "Saving..." : "Save & Add Another"}
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Faculty"}
                    </Button>
                </div>
            </form>
        </Form>
    );
});

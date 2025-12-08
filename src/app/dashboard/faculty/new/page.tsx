"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FacultyForm, FacultyFormValues, FacultyFormRef } from "@/components/faculty/FacultyForm";
import { addFaculty } from "@/actions/faculty/addFaculty";
import { PageHeader } from "@/components/ui/page-header";

export default function NewFacultyPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [stayOnPage, setStayOnPage] = React.useState(false);
    const [formKey, setFormKey] = React.useState(0);
    const formRef = React.useRef<FacultyFormRef>(null);

    async function handleSubmit(data: FacultyFormValues) {
        setIsLoading(true);
        try {
            const result = await addFaculty(data);

            if (result.success) {
                toast.success(result.message);

                if (stayOnPage) {
                    // Reset form to add another faculty
                    formRef.current?.reset();
                    setStayOnPage(false);
                    // Force form remount by changing key
                    setFormKey(prev => prev + 1);
                    // Refresh the page data
                    router.refresh();
                } else {
                    // Navigate to faculty list and refresh
                    router.push("/dashboard/faculty");
                    router.refresh();
                }
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to add faculty member");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSaveAndAddAnother(data: FacultyFormValues) {
        setStayOnPage(true);
        await handleSubmit(data);
    }

    return (
        <div className="container mx-auto px-4 py-6 space-y-8">
            <PageHeader
                title="Add New Faculty"
                description="Enter the essential details of the faculty member"
                backLabel="Back to Faculty"
            />

            {/* Form */}
            <FacultyForm
                key={formKey}
                ref={formRef}
                onSubmit={handleSubmit}
                onSaveAndAddAnother={handleSaveAndAddAnother}
                isLoading={isLoading}
            />
        </div>
    );
}

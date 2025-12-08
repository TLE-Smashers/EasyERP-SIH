"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { createExam } from "@/actions/marks/createExam";
import type { ExamType } from "@/types/marks";

interface CreateExamDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    facultyId: string;
    facultyName: string;
    onSuccess?: () => void;
}

interface ExamFormData {
    examName: string;
    examType: ExamType;
    subject: string;
    department: string;
    semester: string;
    maxMarks: number;
    passingMarks: number;
    examDate: Date;
}

export function CreateExamDialog({
    open,
    onOpenChange,
    facultyId,
    facultyName,
    onSuccess,
}: CreateExamDialogProps) {
    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm<ExamFormData>({
        defaultValues: {
            examName: "",
            examType: "mid_term",
            subject: "",
            department: "",
            semester: "",
            maxMarks: 100,
            passingMarks: 40,
            examDate: new Date(),
        },
    });

    const onSubmit = async (data: ExamFormData) => {
        setIsLoading(true);
        try {
            const result = await createExam({
                ...data,
                examDate: format(data.examDate, "yyyy-MM-dd"),
                facultyId,
                facultyName,
            });

            if (result.success) {
                toast.success(result.message);
                form.reset();
                onOpenChange(false);
                onSuccess?.();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to create exam");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Exam</DialogTitle>
                    <DialogDescription>
                        Set up a new exam to enter marks for your students
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="examName"
                            rules={{ required: "Exam name is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Exam Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Mid Term Exam 2024" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="examType"
                                rules={{ required: "Exam type is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Exam Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select exam type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="mid_term">Mid Term</SelectItem>
                                                <SelectItem value="end_term">End Term</SelectItem>
                                                <SelectItem value="quiz">Quiz</SelectItem>
                                                <SelectItem value="assignment">Assignment</SelectItem>
                                                <SelectItem value="internal">Internal</SelectItem>
                                                <SelectItem value="practical">Practical</SelectItem>
                                                <SelectItem value="project">Project</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="subject"
                                rules={{ required: "Subject is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Data Structures" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="department"
                                rules={{ required: "Department is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., CSE" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="semester"
                                rules={{ required: "Semester is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Semester</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 3" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="maxMarks"
                                rules={{ required: "Max marks is required", min: 1 }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Maximum Marks</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="100"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="passingMarks"
                                rules={{ required: "Passing marks is required", min: 1 }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Passing Marks</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="40"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="examDate"
                            rules={{ required: "Exam date is required" }}
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Exam Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Exam
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

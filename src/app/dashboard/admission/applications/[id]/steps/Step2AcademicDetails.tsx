/**
 * Step 2: Academic Details
 * View and edit student's academic information
 */

"use client";

import { useState } from "react";
import { Application } from "@/types/admission";
import { updateApplication } from "@/actions/admission/updateApplication";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step2AcademicDetailsProps {
  application: Application;
}

export function Step2AcademicDetails({ application }: Step2AcademicDetailsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState(application.academicDetails);

  const handleSave = async () => {
    setIsSaving(true);
    
    const result = await updateApplication(application.id, {
      academicDetails: formData,
    });

    setIsSaving(false);

    if (result.success) {
      toast.success("Academic details updated successfully");
      setIsEditing(false);
    } else {
      toast.error(result.error || "Failed to update academic details");
    }
  };

  const isLocked = application.locked;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-6 border-b">
        <div>
          <h3 className="text-xl md:text-2xl font-semibold text-foreground">Academic Details</h3>
          <p className="text-sm md:text-base text-muted-foreground mt-1.5">
            Review and update student's academic information
          </p>
        </div>
        
        {/* Edit/Cancel Buttons */}
        {!isLocked && (
          <div className="flex gap-2">
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Information
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFormData(application.academicDetails);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-8">
        {/* 10th Standard */}
        <div className="bg-card rounded-lg border p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm font-bold">
              10
            </span>
            10th Standard Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-2">
              <Label htmlFor="school10th" className="text-sm font-medium">
                School Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="school10th"
                value={formData.school10th}
                onChange={(e) =>
                  setFormData({ ...formData, school10th: e.target.value })
                }
                disabled={!isEditing}
                placeholder="School name"
                className={cn(
                  "h-11",
                  !isEditing && "bg-muted/50 cursor-not-allowed"
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="board10th" className="text-sm font-medium">
                Board <span className="text-destructive">*</span>
              </Label>
              <Input
                id="board10th"
                value={formData.board10th}
                onChange={(e) =>
                  setFormData({ ...formData, board10th: e.target.value })
                }
                disabled={!isEditing}
                placeholder="CBSE/State Board/etc"
                className={cn(
                  "h-11",
                  !isEditing && "bg-muted/50 cursor-not-allowed"
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="marks10th" className="text-sm font-medium">
                Marks/Percentage <span className="text-destructive">*</span>
              </Label>
              <Input
                id="marks10th"
                value={formData.marks10th}
                onChange={(e) =>
                  setFormData({ ...formData, marks10th: e.target.value })
                }
                disabled={!isEditing}
                placeholder="85%"
                className={cn(
                  "h-11",
                  !isEditing && "bg-muted/50 cursor-not-allowed"
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearOfPassing10th" className="text-sm font-medium">
                Year of Passing <span className="text-destructive">*</span>
              </Label>
              <Input
                id="yearOfPassing10th"
                value={formData.yearOfPassing10th}
                onChange={(e) =>
                  setFormData({ ...formData, yearOfPassing10th: e.target.value })
                }
                disabled={!isEditing}
                placeholder="2022"
                className={cn(
                  "h-11",
                  !isEditing && "bg-muted/50 cursor-not-allowed"
                )}
              />
            </div>
          </div>
        </div>

        {/* 12th Standard */}
        <div className="bg-card rounded-lg border p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 text-sm font-bold">
              12
            </span>
            12th Standard Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-2">
              <Label htmlFor="school12th" className="text-sm font-medium">
                School Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="school12th"
                value={formData.school12th}
                onChange={(e) =>
                  setFormData({ ...formData, school12th: e.target.value })
                }
                disabled={!isEditing}
                placeholder="School name"
                className={cn(
                  "h-11",
                  !isEditing && "bg-muted/50 cursor-not-allowed"
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="board12th" className="text-sm font-medium">
                Board <span className="text-destructive">*</span>
              </Label>
              <Input
                id="board12th"
                value={formData.board12th}
                onChange={(e) =>
                  setFormData({ ...formData, board12th: e.target.value })
                }
                disabled={!isEditing}
                placeholder="CBSE/State Board/etc"
                className={cn(
                  "h-11",
                  !isEditing && "bg-muted/50 cursor-not-allowed"
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="marks12th" className="text-sm font-medium">
                Marks/Percentage <span className="text-destructive">*</span>
              </Label>
              <Input
                id="marks12th"
                value={formData.marks12th}
                onChange={(e) =>
                  setFormData({ ...formData, marks12th: e.target.value })
                }
                disabled={!isEditing}
                placeholder="75%"
                className={cn(
                  "h-11",
                  !isEditing && "bg-muted/50 cursor-not-allowed"
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearOfPassing12th" className="text-sm font-medium">
                Year of Passing <span className="text-destructive">*</span>
              </Label>
              <Input
                id="yearOfPassing12th"
                value={formData.yearOfPassing12th}
                onChange={(e) =>
                  setFormData({ ...formData, yearOfPassing12th: e.target.value })
                }
                disabled={!isEditing}
                placeholder="2024"
                className={cn(
                  "h-11",
                  !isEditing && "bg-muted/50 cursor-not-allowed"
                )}
              />
            </div>
          </div>
        </div>

        {/* Course Selection */}
        <div className="bg-card rounded-lg border p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 text-sm font-bold">
              🎓
            </span>
            Course Applied For
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-2">
              <Label htmlFor="course" className="text-sm font-medium">
                Course <span className="text-destructive">*</span>
              </Label>
              <Input
                id="course"
                value={formData.course}
                onChange={(e) =>
                  setFormData({ ...formData, course: e.target.value })
                }
                disabled={!isEditing}
                placeholder="B.Tech/B.Sc/etc"
                className={cn(
                  "h-11",
                  !isEditing && "bg-muted/50 cursor-not-allowed"
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch" className="text-sm font-medium">
                Branch/Specialization <span className="text-destructive">*</span>
              </Label>
              <Input
                id="branch"
                value={formData.branch}
                onChange={(e) =>
                  setFormData({ ...formData, branch: e.target.value })
                }
                disabled={!isEditing}
                placeholder="Computer Science/etc"
                className={cn(
                  "h-11",
                  !isEditing && "bg-muted/50 cursor-not-allowed"
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      {!isEditing && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            💡 Click "Edit Information" button above to modify any academic details if needed.
          </p>
        </div>
      )}
    </div>
  );
}

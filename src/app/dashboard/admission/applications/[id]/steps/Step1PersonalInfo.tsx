/**
 * Step 1: Personal Information
 * View and edit student's personal details
 */

"use client";

import { useState } from "react";
import { Application } from "@/types/admission";
import { updateApplication } from "@/actions/admission/updateApplication";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step1PersonalInfoProps {
  application: Application;
}

export function Step1PersonalInfo({ application }: Step1PersonalInfoProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState(application.personalDetails);

  const handleSave = async () => {
    setIsSaving(true);
    
    const result = await updateApplication(application.id, {
      personalDetails: formData,
    });

    setIsSaving(false);

    if (result.success) {
      toast.success("Personal information updated successfully");
      setIsEditing(false);
    } else {
      toast.error(result.error || "Failed to update personal information");
    }
  };

  const isLocked = application.locked;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-6 border-b">
        <div>
          <h3 className="text-xl md:text-2xl font-semibold text-foreground">Personal Information</h3>
          <p className="text-sm md:text-base text-muted-foreground mt-1.5">
            Review and update student's personal details
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
                    setFormData(application.personalDetails);
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
      <div className="bg-card rounded-lg border p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Enter full name"
              className={cn(
                "h-11",
                !isEditing && "bg-muted/50 cursor-not-allowed"
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={!isEditing}
              placeholder="student@example.com"
              className={cn(
                "h-11",
                !isEditing && "bg-muted/50 cursor-not-allowed"
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobileNumber" className="text-sm font-medium">
              Mobile Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mobileNumber"
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) =>
                setFormData({ ...formData, mobileNumber: e.target.value })
              }
              disabled={!isEditing}
              placeholder="+91 XXXXXXXXXX"
              className={cn(
                "h-11",
                !isEditing && "bg-muted/50 cursor-not-allowed"
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-sm font-medium">
              Date of Birth <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) =>
                setFormData({ ...formData, dateOfBirth: e.target.value })
              }
              disabled={!isEditing}
              className={cn(
                "h-11",
                !isEditing && "bg-muted/50 cursor-not-allowed"
              )}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Address <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Complete residential address"
              rows={3}
              className={cn(
                "min-h-[80px]",
                !isEditing && "bg-muted/50 cursor-not-allowed"
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianName" className="text-sm font-medium">
              Guardian Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guardianName"
              value={formData.guardianName}
              onChange={(e) =>
                setFormData({ ...formData, guardianName: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Father/Mother/Guardian name"
              className={cn(
                "h-11",
                !isEditing && "bg-muted/50 cursor-not-allowed"
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianContact" className="text-sm font-medium">
              Guardian Contact <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guardianContact"
              type="tel"
              value={formData.guardianContact}
              onChange={(e) =>
                setFormData({ ...formData, guardianContact: e.target.value })
              }
              disabled={!isEditing}
              placeholder="+91 XXXXXXXXXX"
              className={cn(
                "h-11",
                !isEditing && "bg-muted/50 cursor-not-allowed"
              )}
            />
          </div>
        </div>
      </div>

      {/* Info Note */}
      {!isEditing && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            💡 Click "Edit Information" button above to modify any details if needed.
          </p>
        </div>
      )}
    </div>
  );
}

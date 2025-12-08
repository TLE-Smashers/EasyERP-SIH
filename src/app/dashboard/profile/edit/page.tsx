"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getUserProfile } from "@/actions/profile/getUserProfile";
import { updateUserProfile } from "@/actions/profile/updateUserProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { User } from "@/types/auth";

/**
 * Edit Profile Page
 * Allows users to update their name and department
 */
export default function EditProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    department: "",
  });

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Wait for session to load
        if (status === "loading") {
          return;
        }

        if (status === "unauthenticated" || !session) {
          router.push("/login");
          return;
        }

        const userProfile = await getUserProfile();
        if (!userProfile) {
          router.push("/login");
          return;
        }

        setUser(userProfile);
        setFormData({
          name: userProfile.name,
          department: userProfile.department || "",
        });
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [session, status, router]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSubmitting(true);

    try {
      const result = await updateUserProfile(
        formData.name.trim(),
        formData.department.trim() || undefined
      );

      if (result.success) {
        toast.success("Profile updated successfully!");
        router.push("/dashboard/profile");
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating profile");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading || status === "loading") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-10 w-48" />
        </div>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Unable to load profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-2 max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Link href="/dashboard/profile">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
          <p className="text-xs text-muted-foreground">Update your account information</p>
        </div>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader className="py-3 px-3">
          <CardTitle className="text-base">Profile Information</CardTitle>
          <CardDescription className="text-xs">
            Update your name and department information
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email (Read-only) */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted h-8 text-xs"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            {/* Role (Read-only) */}
            <div className="space-y-1">
              <Label htmlFor="role" className="text-xs">Role</Label>
              <Input
                id="role"
                type="text"
                value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                disabled
                className="bg-muted h-8 text-xs"
              />
              <p className="text-xs text-muted-foreground">Role is assigned by administrator</p>
            </div>

            {/* Name (Editable) */}
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs">Full Name *</Label>
              <Input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                disabled={submitting}
                required
                className="h-8 text-xs"
              />
            </div>

            {/* Department (Editable) */}
            <div className="space-y-1">
              <Label htmlFor="department" className="text-xs">Department</Label>
              <Input
                id="department"
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="Enter your department (optional)"
                disabled={submitting}
                className="h-8 text-xs"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 pt-2">
              <Button asChild variant="outline" className="flex-1 h-8 text-xs">
                <Link href="/dashboard/profile">
                  Cancel
                </Link>
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 h-8 text-xs gap-1"
              >
                {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-3 pt-3">
          <p className="text-xs text-blue-900 dark:text-blue-100">
            <strong>Note:</strong> Your email and role cannot be changed. If you need to update these, please contact your administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

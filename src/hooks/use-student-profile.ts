"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { getStudentProfileByEmail } from "@/actions/student/getStudentProfile";
import type { Student } from "@/types/student";

export function useStudentProfile() {
  const { data: session } = useSession();
  const [student, setStudent] = React.useState<Student | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadProfile = React.useCallback(async () => {
    const email = session?.user?.email;
    if (!email) {
      setIsLoading(false);
      setError("No student email found in session");
      return;
    }

    setIsLoading(true);
    try {
      const result = await getStudentProfileByEmail(email);
      if (result.success && result.data) {
        setStudent(result.data);
        setError(null);
      } else {
        const message = result.message || "Unable to load student profile";
        setStudent(null);
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      console.error("Failed to load student profile", err);
      const message = "Something went wrong while loading your profile";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email]);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return { student, isLoading, error, reload: loadProfile };
}

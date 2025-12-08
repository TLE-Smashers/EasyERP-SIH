"use client";

import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudentProfile } from "@/hooks/use-student-profile";

export default function StudentPersonalInfoPage() {
  const { student, isLoading, error } = useStudentProfile();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">Personal information</p>
        </div>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {error || "We could not find your profile details. Please contact the administration team."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const { personalInfo, academicInfo } = student;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Review and keep your personal information up to date
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt={personalInfo.fullName} />
              <AvatarFallback className="text-xl">
                {getInitials(personalInfo.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{personalInfo.fullName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {academicInfo.course} • {academicInfo.branch}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Student ID: {academicInfo.studentId}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Year / Semester</p>
              <p>
                Year {academicInfo.year}, Semester {academicInfo.semester}
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Batch</p>
              <p>{academicInfo.batch}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="Email" icon={Mail} value={personalInfo.email} />
            <InfoRow
              label="Mobile Number"
              icon={Phone}
              value={personalInfo.mobileNumber}
            />
            <InfoRow
              label="Date of Birth"
              icon={Calendar}
              value={formatDate(personalInfo.dateOfBirth)}
            />
            <InfoRow
              label="Address"
              icon={MapPin}
              value={personalInfo.address || "-"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Guardian Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              label="Guardian Name"
              icon={Users}
              value={personalInfo.guardianName || "-"}
            />
            <InfoRow
              label="Guardian Contact"
              icon={Phone}
              value={personalInfo.guardianContact || "-"}
            />
            <div className="rounded-lg bg-muted/60 p-4 text-sm">
              <p className="font-medium">Why we store this?</p>
              <p className="text-muted-foreground mt-1">
                Your guardian information helps us keep you safe and informed.
                Please contact the administration office if any detail changes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  icon: Icon,
  value,
}: {
  label: string;
  icon: LucideIcon;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <p className="text-base font-medium text-foreground break-words">
        {value}
      </p>
    </div>
  );
}

function formatDate(dateString?: string) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

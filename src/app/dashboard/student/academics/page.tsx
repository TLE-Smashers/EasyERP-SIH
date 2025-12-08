"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  Award,
  BookOpen,
  Calendar,
  GraduationCap,
  Loader2,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudentProfile } from "@/hooks/use-student-profile";
import {
  getStudentExamScores,
  type StudentExamResults,
} from "@/actions/student/getStudentExamScores";

export default function StudentAcademicRecordsPage() {
  const { student, isLoading: profileLoading, error } = useStudentProfile();
  const { data: session } = useSession();
  const [examResults, setExamResults] = React.useState<StudentExamResults | null>(null);
  const [isLoadingResults, setIsLoadingResults] = React.useState(true);
  const [examError, setExamError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadExamResults = async () => {
      if (!session?.user?.email) {
        setIsLoadingResults(false);
        return;
      }

      setIsLoadingResults(true);
      const response = await getStudentExamScores(session.user.email);
      if (response.success && response.data) {
        setExamResults(response.data);
        setExamError(null);
      } else {
        setExamError(response.message || "No exam data available");
        setExamResults(null);
      }
      setIsLoadingResults(false);
    };

    loadExamResults();
  }, [session?.user?.email]);

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Records</h1>
          <p className="text-muted-foreground">Current course details</p>
        </div>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {error || "We could not find your academic record. Please contact support."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const { academicInfo } = student;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Academic Records</h1>
        <p className="text-muted-foreground">
          Overview of your programme and exam performance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Programme Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <DetailRow label="Course" value={academicInfo.course} />
            <DetailRow label="Branch" value={academicInfo.branch} />
            <DetailRow
              label="Year / Semester"
              value={`Year ${academicInfo.year} • Semester ${academicInfo.semester}`}
            />
            <DetailRow label="Batch" value={academicInfo.batch} />
            <DetailRow
              label="Admission Date"
              value={formatDate(academicInfo.admissionDate)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline">Student ID: {academicInfo.studentId}</Badge>
              {academicInfo.rollNumber && (
                <Badge variant="secondary">Roll No: {academicInfo.rollNumber}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Keep track of your academic progress, eligibility, and exam
              performance in one place.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <CardTitle>Exam Performance</CardTitle>
          </div>
          {isLoadingResults && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading latest scores
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {examResults ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <SummaryStat
                  label="Average Percentage"
                  value={`${examResults.overallStats.averagePercentage.toFixed(2)}%`}
                  icon={Award}
                />
                <SummaryStat
                  label="Subjects Evaluated"
                  value={`${examResults.overallStats.totalSubjects}`}
                  icon={BookOpen}
                />
                <SummaryStat
                  label="Exam Types"
                  value={`${examResults.examTypes.length}`}
                  icon={Calendar}
                />
              </div>

              <div className="space-y-4">
                {examResults.examTypes.map((examType) => (
                  <Card key={examType} className="border-border/70">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>{examType}</span>
                        <Badge variant="outline">
                          {examResults.results[examType]?.length || 0} subjects
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(examResults.results[examType] || []).map((subject) => (
                        <div key={`${examType}-${subject.subjectCode}`} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{subject.subjectName}</p>
                              <p className="text-xs text-muted-foreground">
                                {subject.subjectCode} • Max: {subject.maxMarks}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold">
                                {subject.marksObtained}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {subject.percentage}%
                              </p>
                            </div>
                          </div>
                          <Progress
                            value={Math.min(subject.percentage, 100)}
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground">
                            Faculty: {subject.facultyName || "-"} • Updated on {formatDate(subject.enteredDate)}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-10">
              {examError || "Exam results are not available right now."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-base font-medium text-foreground">
        {value || "-"}
      </p>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

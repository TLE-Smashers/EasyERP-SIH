"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Calendar,
  Loader2
} from "lucide-react";
import { getStudentAttendanceByEmail } from "@/actions/student/getStudentAttendance";
import { toast } from "sonner";

export default function StudentAttendancePage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = React.useState(true);
  const [attendanceData, setAttendanceData] = React.useState<{
    overallPercentage: number;
    totalClasses: number;
    totalPresent: number;
    totalAbsent: number;
    subjectWise: Array<{
      subject: string;
      present: number;
      absent: number;
      total: number;
      percentage: number;
    }>;
    recentAttendance: Array<{
      date: string;
      subject: string;
      status: string;
      facultyName: string;
    }>;
  } | null>(null);

  React.useEffect(() => {
    loadAttendanceData();
  }, [session]);

  async function loadAttendanceData() {
    if (!session?.user?.email) return;

    setIsLoading(true);
    try {
      const result = await getStudentAttendanceByEmail(session.user.email);
      
      if (result.success && result.data) {
        setAttendanceData(result.data);
      } else {
        toast.error(result.message || "Failed to load attendance");
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
      toast.error("Failed to load attendance data");
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 85) return "text-green-600";
    if (percentage >= 75) return "text-orange-600";
    return "text-red-600";
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 85) return { text: "Good", class: "bg-green-100 text-green-800" };
    if (percentage >= 75) return { text: "Warning", class: "bg-orange-100 text-orange-800" };
    return { text: "Critical", class: "bg-red-100 text-red-800" };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!attendanceData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <AlertTriangle className="h-12 w-12 mx-auto text-orange-500" />
              <p className="text-lg font-medium">No Attendance Data</p>
              <p className="text-sm text-muted-foreground">
                No attendance records found for your account.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">
          Track your attendance across all subjects
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">
              {attendanceData.overallPercentage}%
            </div>
            <Progress value={attendanceData.overallPercentage} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Across all subjects
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{attendanceData.totalClasses}</div>
            <div className="flex items-center gap-2 mt-3">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm">{attendanceData.totalPresent} Present</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm">{attendanceData.totalAbsent} Absent</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              {attendanceData.overallPercentage >= 75 ? (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-600" />
              )}
              <div>
                <p className="text-lg font-bold">
                  {attendanceData.overallPercentage >= 75 ? "Eligible" : "Not Eligible"}
                </p>
                <p className="text-xs text-muted-foreground">For exams</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum 75% required
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subject-wise Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Attendance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {attendanceData.subjectWise.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No subject-wise attendance data available
            </div>
          ) : (
            attendanceData.subjectWise.map((subject, index) => {
              const statusBadge = getStatusBadge(subject.percentage);
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{subject.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getStatusColor(subject.percentage)}`}>
                        {subject.percentage}%
                      </p>
                      <Badge className={statusBadge.class}>
                        {statusBadge.text}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={subject.percentage} className="h-2" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Present: {subject.present} | Absent: {subject.absent}
                    </span>
                    <span>
                      Total: {subject.total} classes
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {attendanceData.recentAttendance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent attendance records
            </div>
          ) : (
            <div className="space-y-3">
              {attendanceData.recentAttendance.map((record, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{record.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(record.date)} • {record.facultyName}
                      </p>
                    </div>
                  </div>
                  {record.status.toLowerCase() === "present" ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Present
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">
                      <XCircle className="mr-1 h-3 w-3" />
                      Absent
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

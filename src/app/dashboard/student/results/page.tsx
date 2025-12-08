"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Award,
  TrendingUp,
  FileText,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { getStudentExamScores } from "@/actions/student/getStudentExamScores";
import { toast } from "sonner";

export default function StudentResultsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedExamType, setSelectedExamType] = React.useState<string>("all");
  const [resultsData, setResultsData] = React.useState<{
    examTypes: string[];
    results: {
      [examType: string]: Array<{
        subjectCode: string;
        subjectName: string;
        examType: string;
        maxMarks: number;
        marksObtained: number;
        percentage: number;
        remarks: string;
        facultyName: string;
        enteredDate: string;
      }>;
    };
    overallStats: {
      totalSubjects: number;
      averagePercentage: number;
    };
  } | null>(null);

  React.useEffect(() => {
    if (session?.user?.email) {
      loadResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function loadResults() {
    if (!session?.user?.email) return;

    setIsLoading(true);
    try {
      const result = await getStudentExamScores(session.user.email);
      
      if (result.success && result.data) {
        setResultsData(result.data);
        // Set first exam type as default if available
        if (result.data.examTypes.length > 0) {
          setSelectedExamType(result.data.examTypes[0]);
        }
      } else {
        toast.error(result.message || "Failed to load results");
      }
    } catch (error) {
      console.error("Error loading results:", error);
      toast.error("Failed to load exam results");
    } finally {
      setIsLoading(false);
    }
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 60) return "text-yellow-600";
    if (percentage >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "F";
  };

  const getGradeBadge = (percentage: number) => {
    const grade = getGrade(percentage);
    let className = "font-semibold";
    
    if (percentage >= 90) className += " bg-green-100 text-green-800";
    else if (percentage >= 75) className += " bg-blue-100 text-blue-800";
    else if (percentage >= 60) className += " bg-yellow-100 text-yellow-800";
    else if (percentage >= 40) className += " bg-orange-100 text-orange-800";
    else className += " bg-red-100 text-red-800";

    return <Badge className={className}>{grade}</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
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

  if (!resultsData || resultsData.examTypes.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Results</h1>
          <p className="text-muted-foreground">
            View your exam scores across all subjects
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2 py-12">
              <AlertTriangle className="h-12 w-12 mx-auto text-orange-500" />
              <p className="text-lg font-medium">No Results Available</p>
              <p className="text-sm text-muted-foreground">
                No exam results have been published yet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentResults = selectedExamType === "all"
    ? Object.values(resultsData.results).flat()
    : resultsData.results[selectedExamType] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exam Results</h1>
        <p className="text-muted-foreground">
          View your exam scores across all subjects
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {resultsData.overallStats.averagePercentage}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all exams
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {resultsData.overallStats.totalSubjects}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Results published
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {getGrade(resultsData.overallStats.averagePercentage)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Exam Type Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detailed Results</CardTitle>
            <Select value={selectedExamType} onValueChange={setSelectedExamType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select exam type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                {resultsData.examTypes.map((examType) => (
                  <SelectItem key={examType} value={examType}>
                    {examType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {currentResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No results available for the selected exam type
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Code</TableHead>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Exam Type</TableHead>
                    <TableHead className="text-right">Marks</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {result.subjectCode}
                      </TableCell>
                      <TableCell>{result.subjectName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{result.examType}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {result.marksObtained} / {result.maxMarks}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${getGradeColor(result.percentage)}`}>
                        {result.percentage}%
                      </TableCell>
                      <TableCell className="text-center">
                        {getGradeBadge(result.percentage)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {result.facultyName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(result.enteredDate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subject-wise Performance */}
      {selectedExamType !== "all" && currentResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary - {selectedExamType}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentResults.map((result, index) => {
                const percentage = result.percentage;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{result.subjectName}</p>
                        <p className="text-sm text-muted-foreground">
                          {result.subjectCode} • {result.facultyName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${getGradeColor(percentage)}`}>
                          {percentage}%
                        </p>
                        {getGradeBadge(percentage)}
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          percentage >= 75
                            ? "bg-green-500"
                            : percentage >= 60
                            ? "bg-blue-500"
                            : percentage >= 40
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        Marks: {result.marksObtained} / {result.maxMarks}
                      </span>
                      {result.remarks && (
                        <span className="italic">{result.remarks}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StudentsTable } from "@/components/student/StudentsTable";
import { getStudents, getFilterOptions } from "@/actions/student/studentActions";
import type { Student } from "@/types/student";
import { toast } from "sonner";

export function AllStudentsClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  const [branches, setBranches] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [studentsResult, filtersResult] = await Promise.all([
          getStudents(),
          getFilterOptions(),
        ]);

        if (studentsResult.success) {
          setStudents(studentsResult.data);
          setFilteredStudents(studentsResult.data);
        }

        if (filtersResult.success) {
          setBranches(filtersResult.data.branches);
          setYears(filtersResult.data.years);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...students];

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.personalInfo.fullName.toLowerCase().includes(searchLower) ||
          student.academicInfo.studentId.toLowerCase().includes(searchLower) ||
          student.academicInfo.rollNumber?.toLowerCase().includes(searchLower) ||
          student.personalInfo.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply branch filter
    if (selectedBranch !== "all") {
      filtered = filtered.filter(
        (student) => student.academicInfo.branch === selectedBranch
      );
    }

    // Apply year filter
    if (selectedYear !== "all") {
      filtered = filtered.filter(
        (student) => student.academicInfo.year === parseInt(selectedYear)
      );
    }

    setFilteredStudents(filtered);
  }, [searchQuery, selectedBranch, selectedYear, students]);

  const handleViewDetails = (id: string) => {
    router.push(`/dashboard/students/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/students/${id}/edit`);
  };

  const handleChangeStatus = (id: string, status: "active" | "inactive") => {
    // TODO: Implement status change
    toast.success(`Student status updated to ${status}`);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info("Export functionality coming soon");
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedBranch("all");
    setSelectedYear("all");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
          <CardDescription>Please wait while we fetch the students</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      <PageHeader
        title="All Students"
        description="View and manage all enrolled students"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.filter((s) => s.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStudents.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Search and filter students</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, student ID, roll number, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Branch Filter */}
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year Filter */}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    Year {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery || selectedBranch !== "all" || selectedYear !== "all") && (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
          <CardDescription>
            Showing {filteredStudents.length} of {students.length} students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentsTable
            data={filteredStudents}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onChangeStatus={handleChangeStatus}
          />
        </CardContent>
      </Card>
    </div>
  );
}

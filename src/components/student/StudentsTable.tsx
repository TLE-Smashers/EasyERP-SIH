"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Eye, Edit, UserCheck, UserX } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Student } from "@/types/student";

interface StudentsTableProps {
  data: Student[];
  onViewDetails?: (id: string) => void;
  onEdit?: (id: string) => void;
  onChangeStatus?: (id: string, status: "active" | "inactive") => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500";
    case "inactive":
      return "bg-yellow-500";
    case "graduated":
      return "bg-blue-500";
    case "dropped":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return "default";
    case "inactive":
      return "secondary";
    case "graduated":
      return "outline";
    default:
      return "destructive";
  }
};

export function StudentsTable({ data, onViewDetails, onEdit, onChangeStatus }: StudentsTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "academicInfo.studentId",
      header: "Student ID",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.academicInfo.studentId}</div>
      ),
    },
    {
      accessorKey: "personalInfo.fullName",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.personalInfo.fullName}</div>
      ),
    },
    {
      accessorKey: "personalInfo.email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">{row.original.personalInfo.email}</div>
      ),
    },
    {
      accessorKey: "academicInfo.branch",
      header: "Branch",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.academicInfo.branch}</Badge>
      ),
    },
    {
      accessorKey: "academicInfo.year",
      header: "Year",
      cell: ({ row }) => {
        const year = row.original.academicInfo.year;
        return (
          <div className="text-center">
            {isNaN(year) ? "-" : year.toString()}
          </div>
        );
      },
    },
    {
      accessorKey: "academicInfo.rollNumber",
      header: "Roll No.",
      cell: ({ row }) => (
        <div>{row.original.academicInfo.rollNumber || "-"}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${getStatusColor(status)}`} />
            <span className="capitalize">{status}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const student = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails?.(student.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(student.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {student.status !== "active" && (
                <DropdownMenuItem onClick={() => onChangeStatus?.(student.id, "active")}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Mark Active
                </DropdownMenuItem>
              )}
              {student.status !== "inactive" && (
                <DropdownMenuItem onClick={() => onChangeStatus?.(student.id, "inactive")}>
                  <UserX className="mr-2 h-4 w-4" />
                  Mark Inactive
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onViewDetails?.(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {data.length} student(s)
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

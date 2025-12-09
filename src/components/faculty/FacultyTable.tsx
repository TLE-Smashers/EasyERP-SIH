"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    SortingState,
    ColumnFiltersState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import { MoreHorizontal, Eye, Edit, UserX, UserCheck, Download } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export interface Faculty {
    id: string;
    facultyId: string;
    name: string;
    email: string;
    phone: string;
    branch: string;
    designation: string;
    status: string;
    joiningDate: string;
    rowIndex?: number;
}

interface FacultyTableProps {
    data: Faculty[];
    onViewDetails?: (id: string) => void;
    onEdit?: (id: string) => void;
    onChangeStatus?: (id: string, status: "active" | "on_leave" | "inactive") => void;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "active":
            return "bg-green-500";
        case "on_leave":
            return "bg-yellow-500";
        case "inactive":
            return "bg-gray-500";
        default:
            return "bg-gray-500";
    }
};

const getDesignationBadge = (designation: string) => {
    switch (designation) {
        case "professor":
            return "default";
        case "associate_professor":
            return "secondary";
        case "assistant_professor":
            return "outline";
        default:
            return "outline";
    }
};

export function FacultyTable({ data, onViewDetails, onEdit, onChangeStatus }: FacultyTableProps) {
    const router = useRouter();
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState("");

    // CSV Export function
    const exportToCSV = () => {
        const headers = ['Faculty ID', 'Name', 'Email', 'Department', 'Designation', 'Status'];
        const csvData = data.map(faculty => [
            faculty.facultyId,
            faculty.name,
            faculty.email,
            faculty.department,
            faculty.designation.replace(/_/g, ' '),
            faculty.status
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `\"${cell}\"`).join(','))
        ].join('\\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `faculty_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns: ColumnDef<Faculty>[] = [
        {
            accessorKey: "facultyId",
            header: "Faculty ID",
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("facultyId")}</div>
            ),
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("name")}</div>
            ),
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => (
                <div className="text-sm text-muted-foreground">{row.getValue("email")}</div>
            ),
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => <div>{row.getValue("phone")}</div>,
        },
        {
            accessorKey: "branch",
            header: "Department",
            cell: ({ row }) => (
                <Badge variant="secondary">{row.getValue("branch")}</Badge>
            ),
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "designation",
            header: "Designation",
            cell: ({ row }) => (
                <Badge variant={getDesignationBadge(row.getValue("designation"))}>
                    {(row.getValue("designation") as string).replace(/_/g, " ").toUpperCase()}
                </Badge>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(status)}`} />
                        <span className="capitalize">{status.replace(/_/g, " ")}</span>
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "joiningDate",
            header: "Joined",
            cell: ({ row }) => {
                const dateValue = row.getValue("joiningDate") as string;
                if (!dateValue) return <div>-</div>;
                const date = new Date(dateValue);
                return <div>{isNaN(date.getTime()) ? dateValue : date.toLocaleDateString()}</div>;
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const faculty = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewDetails?.(faculty.facultyId)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit?.(faculty.facultyId)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {faculty.status !== "active" && (
                                <DropdownMenuItem onClick={() => onChangeStatus?.(faculty.facultyId, "active")}>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Mark Active
                                </DropdownMenuItem>
                            )}
                            {faculty.status !== "on_leave" && (
                                <DropdownMenuItem onClick={() => onChangeStatus?.(faculty.facultyId, "on_leave")}>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Mark On Leave
                                </DropdownMenuItem>
                            )}
                            {faculty.status !== "inactive" && (
                                <DropdownMenuItem onClick={() => onChangeStatus?.(faculty.facultyId, "inactive")}>
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
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    });

    // Get unique departments and statuses for filtering
    const departments = Array.from(new Set(data.map((f) => f.branch)));
    const statuses = Array.from(new Set(data.map((f) => f.status)));

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search faculty..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                />

                <Select
                    value={(table.getColumn("branch")?.getFilterValue() as string) ?? "all"}
                    onValueChange={(value) =>
                        table.getColumn("branch")?.setFilterValue(value === "all" ? "" : value)
                    }
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                                {dept}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
                    onValueChange={(value) =>
                        table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
                    }
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                                {status.replace(/_/g, " ").toUpperCase()}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant="outline" onClick={exportToCSV} className="ml-auto gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            Columns
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

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
                                    No faculty members found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
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

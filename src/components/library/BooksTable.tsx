"use client";

import * as React from "react";
import { useState } from "react";
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
} from "@tanstack/react-table";
import { Book, BookCategory } from "@/types/library";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, BookOpen, Download } from "lucide-react";

interface BooksTableProps {
  books: Book[];
  onRequestBook: (book: Book) => void;
  onNotifyMe: (book: Book) => void;
  studentMode?: boolean;
}

export function BooksTable({ books, onRequestBook, onNotifyMe, studentMode = true }: BooksTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // CSV Export function
  const exportToCSV = () => {
    const headers = ['Title', 'Author', 'ISBN', 'Category', 'Publisher', 'Rack Number', 'Total Copies', 'Available Copies'];
    const csvData = books.map(book => [
      book.title,
      book.author,
      book.isbn,
      book.category,
      book.publisher,
      book.rackNumber,
      book.totalCopies,
      book.availableCopies
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `\"${cell}\"`).join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `books_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnDef<Book>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.title}</div>
          <div className="text-sm text-muted-foreground">{row.original.author}</div>
        </div>
      ),
    },
    {
      accessorKey: "isbn",
      header: "ISBN",
      cell: ({ row }) => (
        <span className="text-sm font-mono">{row.original.isbn}</span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.category}</Badge>
      ),
    },
    {
      accessorKey: "publisher",
      header: "Publisher",
    },
    {
      accessorKey: "rackNumber",
      header: "Rack",
      cell: ({ row }) => (
        <span className="text-sm font-mono">{row.original.rackNumber}</span>
      ),
    },
    {
      accessorKey: "availableCopies",
      header: "Available",
      cell: ({ row }) => {
        const available = row.original.availableCopies;
        const total = row.original.totalCopies;
        return (
          <div className="text-center">
            <Badge variant={available > 0 ? "default" : "secondary"}>
              {available} / {total}
            </Badge>
          </div>
        );
      },
    },
    ...(studentMode ? [{
      id: "actions",
      header: "Action",
      cell: ({ row }: { row: any }) => {
        const book = row.original as Book;
        const isAvailable = book.availableCopies > 0;
        
        return (
          <div className="flex gap-2">
            {isAvailable ? (
              <Button
                size="sm"
                onClick={() => onRequestBook(book)}
              >
                Request
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNotifyMe(book)}
              >
                Notify Me
              </Button>
            )}
          </div>
        );
      },
    }] : []),
  ];

  const filteredBooks = React.useMemo(() => {
    if (categoryFilter === "all") return books;
    return books.filter(book => book.category === categoryFilter);
  }, [books, categoryFilter]);

  const table = useReactTable({
    data: filteredBooks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const categories: BookCategory[] = [
    'Fiction',
    'Non-Fiction',
    'Reference',
    'Textbook',
    'Research',
    'Journal',
    'Magazine',
    'Other',
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, author, or ISBN..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportToCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                  <div className="flex flex-col items-center justify-center gap-2">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No books found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {filteredBooks.length} book(s)
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

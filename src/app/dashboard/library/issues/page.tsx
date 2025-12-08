"use client";

import { useState, useEffect } from "react";
import { IssuedBook } from "@/types/library";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IssuedBooksTable } from "@/components/library/IssuedBooksTable";
import { getAllIssuedBooks, getOverdueBooks } from "@/actions/library/issueBook";
import { toast } from "sonner";
import { RefreshCw, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";

export default function LibraryIssuesPage() {
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([]);
  const [overdueBooks, setOverdueBooks] = useState<IssuedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [issuedRes, overdueRes] = await Promise.all([
        getAllIssuedBooks(),
        getOverdueBooks(),
      ]);

      if (issuedRes.success) setIssuedBooks(issuedRes.data || []);
      if (overdueRes.success) setOverdueBooks(overdueRes.data || []);
    } catch (error) {
      toast.error("Failed to load issued books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter books based on search query
  const filterBooks = (books: IssuedBook[]) => {
    if (!searchQuery.trim()) return books;
    
    const query = searchQuery.toLowerCase();
    return books.filter((book) =>
      book.studentName.toLowerCase().includes(query) ||
      book.studentId.toLowerCase().includes(query) ||
      book.email.toLowerCase().includes(query) ||
      book.rollNumber?.toLowerCase().includes(query) ||
      book.bookTitle.toLowerCase().includes(query) ||
      book.bookAuthor.toLowerCase().includes(query)
    );
  };

  const filteredIssuedBooks = filterBooks(issuedBooks);
  const filteredOverdueBooks = filterBooks(overdueBooks);

  return (
    <div>
      <div className="space-y-6">
      <PageHeader
        title="Issued Books"
        description="Manage books currently issued to students"
        actions={
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by student name, ID, email, roll number, or book title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Issued ({filteredIssuedBooks.length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({filteredOverdueBooks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <IssuedBooksTable issuedBooks={filteredIssuedBooks} onUpdate={fetchData} />
        </TabsContent>

        <TabsContent value="overdue">
          {filteredOverdueBooks.length === 0 ? (
            <div className="border rounded-lg p-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery.trim() ? "No matching overdue books" : "No overdue books"}
              </p>
            </div>
          ) : (
            <IssuedBooksTable issuedBooks={filteredOverdueBooks} onUpdate={fetchData} />
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

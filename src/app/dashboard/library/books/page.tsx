"use client";

import { useState, useEffect } from "react";
import { Book, BookCategory, BookStatus, BOOK_CATEGORIES, BOOK_STATUS } from "@/types/library";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getBooks } from "@/actions/library/getBooks";
import { addBook, updateBook, deleteBook } from "@/actions/library/bookActions";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, RefreshCw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";

export default function LibraryBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "Fiction" as BookCategory,
    totalCopies: 1,
    publisher: "",
    publicationYear: new Date().getFullYear().toString(),
    description: "",
    subject: "",
    edition: "1st",
    rackNumber: "",
    coverImageUrl: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getBooks();
      if (res.success) {
        setBooks(res.data || []);
        setFilteredBooks(res.data || []);
      }
    } catch (error) {
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter books based on search and filters
  useEffect(() => {
    let filtered = [...books];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.isbn.toLowerCase().includes(query)
      );
    }
    
    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((book) => book.category === categoryFilter);
    }
    
    // Status filter - Note: Book interface doesn't have status field yet
    // Skip status filtering for now
    
    setFilteredBooks(filtered);
  }, [searchQuery, categoryFilter, statusFilter, books]);

  const handleAddBook = async () => {
    try {
      setLoading(true);
      const result = await addBook(formData);
      
      if (result.success) {
        toast.success("Book added successfully");
        setIsAddDialogOpen(false);
        resetForm();
        await fetchData();
      } else {
        toast.error(result.error || "Failed to add book");
      }
    } catch (error) {
      toast.error("An error occurred while adding the book");
    } finally {
      setLoading(false);
    }
  };

  const handleEditBook = async () => {
    if (!selectedBook) return;
    
    try {
      setLoading(true);
      const result = await updateBook(selectedBook.bookId, formData);
      
      if (result.success) {
        toast.success("Book updated successfully");
        setIsEditDialogOpen(false);
        resetForm();
        await fetchData();
      } else {
        toast.error(result.error || "Failed to update book");
      }
    } catch (error) {
      toast.error("An error occurred while updating the book");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!selectedBook) return;
    
    try {
      setLoading(true);
      const result = await deleteBook(selectedBook.bookId);
      
      if (result.success) {
        toast.success("Book deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedBook(null);
        await fetchData();
      } else {
        toast.error(result.error || "Failed to delete book");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the book");
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (book: Book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      totalCopies: book.totalCopies,
      publisher: book.publisher || "",
      publicationYear: book.publicationYear || "",
      description: book.description || "",
      subject: book.subject || "",
      edition: book.edition || "1st",
      rackNumber: book.rackNumber || "",
      coverImageUrl: book.coverImageUrl || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (book: Book) => {
    setSelectedBook(book);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      isbn: "",
      category: "Fiction",
      totalCopies: 1,
      publisher: "",
      publicationYear: new Date().getFullYear().toString(),
      description: "",
      subject: "",
      edition: "1st",
      rackNumber: "",
      coverImageUrl: "",
    });
    setSelectedBook(null);
  };

  const getCategoryBadgeColor = (category: BookCategory) => {
    const colors: Record<BookCategory, string> = {
      'Fiction': "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      'Non-Fiction': "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      'Reference': "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      'Textbook': "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      'Research': "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      'Journal': "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
      'Magazine': "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
      'Other': "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };
    return colors[category];
  };

  return (
    <div>
      <div className="space-y-6">
      <PageHeader
        title="Book Catalog"
        description="Manage library book inventory and catalog"
        actions={
          <>
            <Button
              variant="outline"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {BOOK_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Total Books</p>
          <p className="text-2xl font-bold">{books.length}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Available</p>
          <p className="text-2xl font-bold">
            {books.filter((b) => b.availableCopies > 0).length}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Total Copies</p>
          <p className="text-2xl font-bold">
            {books.reduce((sum, b) => sum + b.totalCopies, 0)}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Available Copies</p>
          <p className="text-2xl font-bold">
            {books.reduce((sum, b) => sum + b.availableCopies, 0)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Copies</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  No books found
                </TableCell>
              </TableRow>
            ) : (
              filteredBooks.map((book) => (
                <TableRow key={book.bookId}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{book.title}</p>
                      {book.publisher && (
                        <p className="text-xs text-muted-foreground">
                          {book.publisher}
                          {book.publicationYear && ` (${book.publicationYear})`}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell className="font-mono text-sm">{book.isbn}</TableCell>
                  <TableCell>
                    <Badge className={getCategoryBadgeColor(book.category)}>
                      {book.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{book.availableCopies}</span> / {book.totalCopies}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(book)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(book)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Book Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
            <DialogDescription>
              Enter the details of the new book to add to the library.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Book title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Author name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN *</Label>
                <Input
                  id="isbn"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  placeholder="ISBN number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value as BookCategory })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOK_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalCopies">Total Copies *</Label>
                <Input
                  id="totalCopies"
                  type="number"
                  min="1"
                  value={formData.totalCopies}
                  onChange={(e) =>
                    setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publisher">Publisher</Label>
                <Input
                  id="publisher"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  placeholder="Publisher name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Publication Year</Label>
                <Input
                  id="year"
                  value={formData.publicationYear}
                  onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
                  placeholder="YYYY"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Book subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edition">Edition</Label>
                <Input
                  id="edition"
                  value={formData.edition}
                  onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                  placeholder="e.g., 1st, 2nd"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rackNumber">Rack Number</Label>
                <Input
                  id="rackNumber"
                  value={formData.rackNumber}
                  onChange={(e) => setFormData({ ...formData, rackNumber: e.target.value })}
                  placeholder="Rack location"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverImageUrl">Cover Image URL</Label>
              <Input
                id="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                placeholder="https://example.com/cover.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Book description or summary"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddBook}>Add Book</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Book Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogDescription>
              Update the details of {selectedBook?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-author">Author *</Label>
                <Input
                  id="edit-author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-isbn">ISBN *</Label>
                <Input
                  id="edit-isbn"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value as BookCategory })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOK_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-totalCopies">Total Copies *</Label>
                <Input
                  id="edit-totalCopies"
                  type="number"
                  min="1"
                  value={formData.totalCopies}
                  onChange={(e) =>
                    setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-publisher">Publisher</Label>
                <Input
                  id="edit-publisher"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-year">Publication Year</Label>
                <Input
                  id="edit-year"
                  value={formData.publicationYear}
                  onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-subject">Subject</Label>
                <Input
                  id="edit-subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Book subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-edition">Edition</Label>
                <Input
                  id="edit-edition"
                  value={formData.edition}
                  onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                  placeholder="e.g., 1st, 2nd"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-rackNumber">Rack Number</Label>
                <Input
                  id="edit-rackNumber"
                  value={formData.rackNumber}
                  onChange={(e) => setFormData({ ...formData, rackNumber: e.target.value })}
                  placeholder="Rack location"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-coverImageUrl">Cover Image URL</Label>
              <Input
                id="edit-coverImageUrl"
                value={formData.coverImageUrl}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                placeholder="https://example.com/cover.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditBook}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Book</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove &quot;{selectedBook?.title}&quot; from the catalog?
              This will mark the book as removed but won&apos;t delete historical records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBook}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

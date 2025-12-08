"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Bell, 
  Plus, 
  Trash2, 
  Users,
  AlertCircle,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { createNotice, getAllNotices, deleteNotice, type Notice } from "@/lib/google/sheets.notices";

export default function AdminNoticesPage() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [notices, setNotices] = React.useState<Notice[]>([]);

  // Form state
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [category, setCategory] = React.useState<"Holiday" | "Result" | "Event" | "Exam" | "General">("General");
  const [priority, setPriority] = React.useState<"High" | "Medium" | "Low">("Medium");
  const [targetAudience, setTargetAudience] = React.useState<"Students" | "Faculty" | "All">("All");
  const [expiryDays, setExpiryDays] = React.useState("7");

  React.useEffect(() => {
    loadNotices();
  }, []);

  async function loadNotices() {
    setIsLoading(true);
    try {
      const result = await getAllNotices();
      if (result.success && result.data) {
        setNotices(result.data);
      } else {
        toast.error(result.message || "Failed to load notices");
      }
    } catch (error) {
      console.error("Error loading notices:", error);
      toast.error("Failed to load notices");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    if (!session?.user?.email || !session?.user?.name) {
      toast.error("Session not found");
      return;
    }

    setIsSubmitting(true);
    try {
      const publishedDate = new Date().toISOString();
      const expiryDate = new Date(
        Date.now() + parseInt(expiryDays) * 24 * 60 * 60 * 1000
      ).toISOString();

      const result = await createNotice({
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
        category,
        priority,
        targetAudience,
        publishedBy: session.user.email,
        publishedByName: session.user.name,
        publishedDate,
        expiryDate,
      });

      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
        resetForm();
        loadNotices();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error creating notice:", error);
      toast.error("Failed to create notice");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(noticeId: string) {
    if (!confirm("Are you sure you want to delete this notice?")) return;

    try {
      const result = await deleteNotice(noticeId);
      if (result.success) {
        toast.success(result.message);
        loadNotices();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error deleting notice:", error);
      toast.error("Failed to delete notice");
    }
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setImageUrl("");
    setCategory("General");
    setPriority("Medium");
    setTargetAudience("All");
    setExpiryDays("7");
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case "Medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "Low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      Holiday: "bg-blue-100 text-blue-800",
      Result: "bg-purple-100 text-purple-800",
      Event: "bg-green-100 text-green-800",
      Exam: "bg-orange-100 text-orange-800",
      General: "bg-gray-100 text-gray-800",
    };
    return <Badge className={colors[category] || ""}>{category}</Badge>;
  };

  const getStatusBadge = (status: string, expiryDate: string) => {
    const isExpired = new Date(expiryDate) < new Date();
    if (isExpired || status === "Expired") {
      return <Badge variant="outline" className="text-red-600">Expired</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notice Management</h1>
          <p className="text-muted-foreground">
            Publish notices to students and faculty
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Notice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Notice</DialogTitle>
              <DialogDescription>
                Publish a notice to students and/or faculty members
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter notice title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter notice description..."
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <div className="flex gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground mt-3" />
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Paste a public image URL (from Google Drive, Imgur, etc.)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={(value: string) => setCategory(value as typeof category)}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Holiday">Holiday</SelectItem>
                      <SelectItem value="Result">Result</SelectItem>
                      <SelectItem value="Event">Event</SelectItem>
                      <SelectItem value="Exam">Exam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={(value: string) => setPriority(value as typeof priority)}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Select value={targetAudience} onValueChange={(value: string) => setTargetAudience(value as typeof targetAudience)}>
                    <SelectTrigger id="targetAudience">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All (Students & Faculty)</SelectItem>
                      <SelectItem value="Students">Students Only</SelectItem>
                      <SelectItem value="Faculty">Faculty Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDays">Auto-Delete After (Days)</Label>
                  <Input
                    id="expiryDays"
                    type="number"
                    min="1"
                    max="365"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium">Notice will expire automatically</p>
                    <p className="text-blue-700">
                      This notice will be automatically deleted after {expiryDays} days from publication.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Publish Notice
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{notices.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Notices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {notices.filter((n) => n.status === "Active" && new Date(n.expiryDate) > new Date()).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Expired Notices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {notices.filter((n) => n.status === "Expired" || new Date(n.expiryDate) < new Date()).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notices List */}
      <Card>
        <CardHeader>
          <CardTitle>All Notices</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : notices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notices published yet</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notices.map((notice) => (
                    <TableRow key={notice.noticeId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{notice.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {notice.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(notice.category)}</TableCell>
                      <TableCell>{getPriorityBadge(notice.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span className="text-sm">{notice.targetAudience}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(notice.publishedDate)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(notice.expiryDate)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(notice.status, notice.expiryDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notice.noticeId)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { shareEbook } from '@/actions/federation/shareEbook';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface UploadSharedEbookFormProps {
  userId: string;
  userName: string;
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  author: string;
  isbn: string;
  publishedYear: string;
  category: string;
  subject: string;
  description: string;
  fileUrl: string;
  fileSize: string;
  fileType: 'pdf' | 'epub' | 'mobi' | 'other';
  coverImageUrl: string;
  tags: string;
  language: string;
  pageCount: string;
}

const CATEGORIES = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Business Administration',
  'General Studies',
  'Other',
];

const FILE_TYPES = ['pdf', 'epub', 'mobi', 'other'];

export function UploadSharedEbookForm({ userId, userName, onSuccess }: UploadSharedEbookFormProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>();

  const fileType = watch('fileType');

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await shareEbook({
        localEbookId: `LOCAL-${Date.now()}`,
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        publishedYear: data.publishedYear,
        category: data.category,
        subject: data.subject,
        description: data.description,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        fileType: data.fileType,
        coverImageUrl: data.coverImageUrl,
        uploadedBy: userId,
        uploadedByName: userName,
        shareWith: ['all'], // Share with all institutions
        accessType: 'open' as any,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        language: data.language || 'English',
        pageCount: data.pageCount ? parseInt(data.pageCount) : undefined,
      });

      if (result.success) {
        toast.success('E-book uploaded successfully to federation!');
        reset();
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to upload e-book');
      }
    } catch (error) {
      toast.error('An error occurred while uploading');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="e.g., Introduction to Algorithms"
              className="h-10"
            />
            {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author *</Label>
            <Input
              id="author"
              {...register('author', { required: 'Author is required' })}
              placeholder="e.g., Thomas H. Cormen"
              className="h-10"
            />
            {errors.author && <p className="text-sm text-red-600">{errors.author.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="isbn">ISBN</Label>
            <Input
              id="isbn"
              {...register('isbn')}
              placeholder="978-0262033848"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="publishedYear">Published Year *</Label>
            <Input
              id="publishedYear"
              {...register('publishedYear', { required: 'Year is required' })}
              placeholder="2022"
              className="h-10"
            />
            {errors.publishedYear && <p className="text-sm text-red-600">{errors.publishedYear.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language *</Label>
            <Input
              id="language"
              {...register('language', { required: 'Language is required' })}
              defaultValue="English"
              placeholder="English"
              className="h-10"
            />
          </div>
        </div>
      </div>

      {/* Category & Subject */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Classification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select onValueChange={(value) => setValue('category', value)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              {...register('subject', { required: 'Subject is required' })}
              placeholder="Data Structures"
              className="h-10"
            />
            {errors.subject && <p className="text-sm text-red-600">{errors.subject.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Brief description of the e-book content..."
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      {/* File Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">File Details</h3>
        <div className="space-y-2">
          <Label htmlFor="fileUrl">Google Drive File URL *</Label>
          <Input
            id="fileUrl"
            {...register('fileUrl', { required: 'File URL is required' })}
            placeholder="https://drive.google.com/file/d/..."
            className="h-10"
          />
          {errors.fileUrl && <p className="text-sm text-red-600">{errors.fileUrl.message}</p>}
          <p className="text-xs text-muted-foreground">
            Upload to Google Drive and paste the shareable link
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fileType">File Type *</Label>
            <Select onValueChange={(value) => setValue('fileType', value as any)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {FILE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileSize">File Size (MB) *</Label>
            <Input
              id="fileSize"
              {...register('fileSize', { required: 'File size is required' })}
              placeholder="5.0"
              type="number"
              step="0.1"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pageCount">Page Count</Label>
            <Input
              id="pageCount"
              {...register('pageCount')}
              placeholder="350"
              type="number"
              className="h-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="coverImageUrl">Cover Image URL (optional)</Label>
          <Input
            id="coverImageUrl"
            {...register('coverImageUrl')}
            placeholder="https://drive.google.com/..."
            className="h-10"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          {...register('tags')}
          placeholder="algorithms, textbook, data-structures"
          className="h-10"
        />
        <p className="text-xs text-muted-foreground">
          Add relevant keywords to help students find this resource
        </p>
      </div>

      <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading to Federation...
          </>
        ) : (
          'Upload E-Book to Shared Resources'
        )}
      </Button>
    </form>
  );
}

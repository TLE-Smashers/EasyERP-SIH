'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { uploadVideo } from '@/actions/videos/videoActions';
import { Loader2 } from 'lucide-react';

interface UploadSharedVideoFormProps {
  userId: string;
  userName: string;
  userRole: 'faculty' | 'librarian' | 'admin' | 'super-admin';
  onSuccess?: () => void;
}

interface FormData {
  type: 'video' | 'lecture' | 'research-paper' | 'presentation' | 'other';
  title: string;
  author: string;
  category: string;
  description: string;
  fileUrl: string;
  tags: string;
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

const RESOURCE_TYPES = [
  { value: 'video', label: 'Video Lecture' },
  { value: 'lecture', label: 'Recorded Lecture' },
  { value: 'research-paper', label: 'Research Paper' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'other', label: 'Other Resource' },
];

export function UploadSharedVideoForm({ userId, userName, userRole, onSuccess }: UploadSharedVideoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      type: 'video',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await uploadVideo(
        {
          title: data.title,
          author: data.author,
          category: data.category,
          description: data.description,
          fileUrl: data.fileUrl,
          tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        },
        userId,
        userName,
        userRole
      );

      if (result.success) {
        toast.success('Video uploaded successfully!');
        reset();
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to upload video');
      }
    } catch (error) {
      toast.error('An error occurred while uploading');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="type">Resource Type *</Label>
        <Select onValueChange={(value) => setValue('type', value as any)} defaultValue="video">
          <SelectTrigger>
            <SelectValue placeholder="Select resource type" />
          </SelectTrigger>
          <SelectContent>
            {RESOURCE_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          {...register('title', { required: 'Title is required' })}
          placeholder="e.g., Introduction to Machine Learning"
        />
        {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="author">Instructor/Author *</Label>
        <Input
          id="author"
          {...register('author', { required: 'Author is required' })}
          placeholder="e.g., Dr. Andrew Ng"
        />
        {errors.author && <p className="text-sm text-red-600 mt-1">{errors.author.message}</p>}
      </div>

      <div>
        <Label htmlFor="category">Category *</Label>
        <Select onValueChange={(value) => setValue('category', value)}>
          <SelectTrigger>
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

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Brief description of the content"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="fileUrl">Resource URL *</Label>
        <Input
          id="fileUrl"
          {...register('fileUrl', { required: 'Resource URL is required' })}
          placeholder="YouTube link, Google Drive link, or direct URL"
        />
        {errors.fileUrl && <p className="text-sm text-red-600 mt-1">{errors.fileUrl.message}</p>}
        <p className="text-xs text-muted-foreground mt-1">
          Provide YouTube link, upload to Google Drive and paste shareable link, or any accessible URL
        </p>
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          {...register('tags')}
          placeholder="machine-learning, ai, introduction, lecture"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Add tags to help students find this resource
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading Video...
          </>
        ) : (
          'Upload Video'
        )}
      </Button>
    </form>
  );
}

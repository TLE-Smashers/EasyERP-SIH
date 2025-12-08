'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { uploadResource } from '@/actions/library/resourceActions';
import type { ResourceType, ResourceCategory, FileType } from '@/types/library';
import { RESOURCE_CATEGORIES, FILE_TYPES } from '@/types/library';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface UploadResourceFormProps {
  type: ResourceType;
  uploaderId: string;
  uploaderRole: 'librarian' | 'faculty';
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  author: string;
  category: ResourceCategory;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  fileType: FileType;
  tags: string;
}

export function UploadResourceForm({
  type,
  uploaderId,
  uploaderRole,
  onSuccess,
}: UploadResourceFormProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const uploaderName = session?.user?.name || 'Unknown';

      const result = await uploadResource(
        {
          type,
          title: data.title,
          author: data.author,
          category: data.category,
          description: data.description,
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileSize: parseInt(data.fileSize, 10),
          fileType: data.fileType,
          tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
        },
        uploaderId,
        uploaderName,
        uploaderRole
      );

      if (result.success) {
        toast.success(`${type === 'ebook' ? 'E-Book' : 'Resource'} uploaded successfully`);
        reset();
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to upload');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          {...register('title', { required: 'Title is required' })}
          placeholder="Enter title"
        />
        {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="author">Author/Creator *</Label>
        <Input
          id="author"
          {...register('author', { required: 'Author is required' })}
          placeholder="Enter author name"
        />
        {errors.author && <p className="text-sm text-red-600 mt-1">{errors.author.message}</p>}
      </div>

      <div>
        <Label htmlFor="category">Category *</Label>
        <Select onValueChange={(value) => setValue('category', value as ResourceCategory)}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {RESOURCE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...register('description', { required: 'Description is required' })}
          placeholder="Brief description"
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="fileUrl">Google Drive Link *</Label>
        <Input
          id="fileUrl"
          {...register('fileUrl', { required: 'File URL is required' })}
          placeholder="https://drive.google.com/file/d/..."
        />
        {errors.fileUrl && <p className="text-sm text-red-600 mt-1">{errors.fileUrl.message}</p>}
        <p className="text-xs text-muted-foreground mt-1">
          Upload file to Google Drive and paste the shareable link here
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fileName">File Name *</Label>
          <Input
            id="fileName"
            {...register('fileName', { required: 'File name is required' })}
            placeholder="example.pdf"
          />
          {errors.fileName && (
            <p className="text-sm text-red-600 mt-1">{errors.fileName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="fileType">File Type *</Label>
          <Select onValueChange={(value) => setValue('fileType', value as FileType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {FILE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.fileType && (
            <p className="text-sm text-red-600 mt-1">{errors.fileType.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="fileSize">File Size (in bytes) *</Label>
        <Input
          id="fileSize"
          type="number"
          {...register('fileSize', { required: 'File size is required' })}
          placeholder="5242880"
        />
        {errors.fileSize && <p className="text-sm text-red-600 mt-1">{errors.fileSize.message}</p>}
        <p className="text-xs text-muted-foreground mt-1">1 MB = 1048576 bytes</p>
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          {...register('tags')}
          placeholder="algorithms, data-structures, textbook"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Add tags to help students find this resource
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          `Upload ${type === 'ebook' ? 'E-Book' : 'Resource'}`
        )}
      </Button>
    </form>
  );
}

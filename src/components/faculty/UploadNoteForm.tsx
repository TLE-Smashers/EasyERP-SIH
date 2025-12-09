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
import { uploadFacultyNote } from '@/actions/faculty/noteActions';
import { Loader2 } from 'lucide-react';

interface UploadNoteFormProps {
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  subject: string;
  topic: string;
  course: string;
  semester: string;
  branch: string;
  description: string;
  fileUrl: string;
  fileType: 'pdf' | 'ppt' | 'doc' | 'other';
  fileSize: string;
  tags: string;
  academicYear: string;
}

const FILE_TYPES = ['pdf', 'ppt', 'doc', 'other'];
const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export function UploadNoteForm({ onSuccess }: UploadNoteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const fileType = watch('fileType');
  const semester = watch('semester');

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await uploadFacultyNote({
        title: data.title,
        subject: data.subject,
        topic: data.topic,
        course: data.course,
        semester: data.semester,
        branch: data.branch,
        description: data.description,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        academicYear: data.academicYear,
      });

      if (result.success) {
        toast.success('Note uploaded successfully');
        reset();
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to upload note');
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
      {/* Title */}
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          {...register('title', { required: 'Title is required' })}
          placeholder="e.g., Operating Systems Basics"
        />
        {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
      </div>

      {/* Subject and Topic */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="subject">Subject *</Label>
          <Input
            id="subject"
            {...register('subject', { required: 'Subject is required' })}
            placeholder="e.g., Operating Systems"
          />
          {errors.subject && <p className="text-sm text-red-600 mt-1">{errors.subject.message}</p>}
        </div>

        <div>
          <Label htmlFor="topic">Topic *</Label>
          <Input
            id="topic"
            {...register('topic', { required: 'Topic is required' })}
            placeholder="e.g., Process Scheduling"
          />
          {errors.topic && <p className="text-sm text-red-600 mt-1">{errors.topic.message}</p>}
        </div>
      </div>

      {/* Course, Semester, Branch */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="course">Course *</Label>
          <Input
            id="course"
            {...register('course', { required: 'Course is required' })}
            placeholder="e.g., B.Tech CSE"
          />
          {errors.course && <p className="text-sm text-red-600 mt-1">{errors.course.message}</p>}
        </div>

        <div>
          <Label htmlFor="semester">Semester *</Label>
          <Select onValueChange={(value) => setValue('semester', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {SEMESTERS.map((sem) => (
                <SelectItem key={sem} value={sem}>
                  Semester {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.semester && <p className="text-sm text-red-600 mt-1">{errors.semester.message}</p>}
        </div>

        <div>
          <Label htmlFor="branch">Branch</Label>
          <Input
            id="branch"
            {...register('branch')}
            placeholder="e.g., Computer Science"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Brief description of the note content"
          rows={3}
        />
      </div>

      {/* File URL */}
      <div>
        <Label htmlFor="fileUrl">Google Drive Link *</Label>
        <Input
          id="fileUrl"
          {...register('fileUrl', { required: 'File URL is required' })}
          placeholder="https://drive.google.com/file/d/..."
        />
        {errors.fileUrl && <p className="text-sm text-red-600 mt-1">{errors.fileUrl.message}</p>}
        <p className="text-xs text-muted-foreground mt-1">
          Upload file to Google Drive with &quot;Anyone with the link&quot; access and paste the link here
        </p>
      </div>

      {/* File Type and Size */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fileType">File Type *</Label>
          <Select onValueChange={(value) => setValue('fileType', value as any)}>
            <SelectTrigger>
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
          {errors.fileType && (
            <p className="text-sm text-red-600 mt-1">{errors.fileType.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="fileSize">File Size</Label>
          <Input
            id="fileSize"
            {...register('fileSize')}
            placeholder="e.g., 2MB"
          />
          <p className="text-xs text-muted-foreground mt-1">Optional, e.g., 2MB, 500KB</p>
        </div>
      </div>

      {/* Academic Year and Tags */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="academicYear">Academic Year</Label>
          <Input
            id="academicYear"
            {...register('academicYear')}
            placeholder="e.g., 2023-24"
          />
        </div>

        <div>
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            {...register('tags')}
            placeholder="e.g., os, scheduling, cpu"
          />
          <p className="text-xs text-muted-foreground mt-1">Comma-separated tags</p>
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          'Upload Note'
        )}
      </Button>
    </form>
  );
}

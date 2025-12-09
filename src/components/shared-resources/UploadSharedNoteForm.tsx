'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { shareNote } from '@/actions/federation/shareNote';
import { Loader2 } from 'lucide-react';

interface UploadSharedNoteFormProps {
  userId: string;
  userName: string;
  userEmail: string;
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

export function UploadSharedNoteForm({ userId, userName, userEmail, onSuccess }: UploadSharedNoteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await shareNote({
        localNoteId: `LOCAL-${Date.now()}`,
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
        facultyId: userId,
        facultyName: userName,
        facultyEmail: userEmail,
        shareWith: ['all'], // Share with all institutions
        accessType: 'open' as any,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        academicYear: data.academicYear,
      });

      if (result.success) {
        toast.success('Notes uploaded successfully to federation!');
        reset();
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to upload notes');
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
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          {...register('title', { required: 'Title is required' })}
          placeholder="e.g., Operating Systems Basics"
          className="h-10"
        />
        {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject *</Label>
          <Input
            id="subject"
            {...register('subject', { required: 'Subject is required' })}
            placeholder="e.g., Operating Systems"
            className="h-10"
          />
          {errors.subject && <p className="text-sm text-red-600">{errors.subject.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="topic">Topic *</Label>
          <Input
            id="topic"
            {...register('topic', { required: 'Topic is required' })}
            placeholder="e.g., Process Scheduling"
            className="h-10"
          />
          {errors.topic && <p className="text-sm text-red-600">{errors.topic.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="course">Course *</Label>
          <Input
            id="course"
            {...register('course', { required: 'Course is required' })}
            placeholder="e.g., B.Tech"
            className="h-10"
          />
          {errors.course && <p className="text-sm text-red-600">{errors.course.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="semester">Semester *</Label>
          <Select onValueChange={(value) => setValue('semester', value)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              {SEMESTERS.map((sem) => (
                <SelectItem key={sem} value={sem}>
                  Semester {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="branch">Branch *</Label>
          <Input
            id="branch"
            {...register('branch', { required: 'Branch is required' })}
            placeholder="e.g., CSE"
            className="h-10"
          />
          {errors.branch && <p className="text-sm text-red-600">{errors.branch.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="academicYear">Academic Year *</Label>
        <Input
          id="academicYear"
          {...register('academicYear', { required: 'Academic year is required' })}
          placeholder="e.g., 2024-25"
          className="h-10"
        />
        {errors.academicYear && <p className="text-sm text-red-600">{errors.academicYear.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Brief description of the notes"
          rows={3}
          className="resize-none"
        />
      </div>

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
          Upload file to Google Drive and paste shareable link here
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            placeholder="e.g., 2.5"
            type="number"
            step="0.1"
            className="h-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          {...register('tags')}
          placeholder="os, process, scheduling"
          className="h-10"
        />
        <p className="text-xs text-muted-foreground">
          Add tags to help students find your notes
        </p>
      </div>

      <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading to Federation...
          </>
        ) : (
          'Upload Notes to Shared Resources'
        )}
      </Button>
    </form>
  );
}

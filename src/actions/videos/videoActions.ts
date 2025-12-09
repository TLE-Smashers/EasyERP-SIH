"use server";

import { addVideo, getVideos } from "@/lib/google/sheets.videos";

export async function uploadVideo(data: {
  title: string;
  author: string;
  category: string;
  description?: string;
  fileUrl: string;
  tags?: string[];
}, userId: string, userName: string, userRole: string) {
  try {
    const result = await addVideo({
      title: data.title,
      author: data.author,
      category: data.category,
      description: data.description,
      fileUrl: data.fileUrl,
      uploadedBy: userId,
      uploadedByName: userName,
      uploadedByRole: userRole,
      uploadDate: new Date().toISOString().split('T')[0],
      tags: data.tags,
    });

    return result;
  } catch (error) {
    return { success: false, error: 'Failed to upload video' };
  }
}

export async function fetchVideos() {
  try {
    const videos = await getVideos();
    return { success: true, videos };
  } catch (error) {
    return { success: false, videos: [], error: 'Failed to fetch videos' };
  }
}

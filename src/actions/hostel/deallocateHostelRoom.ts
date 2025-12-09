/**
 * Deallocate hostel room for a student (action wrapper)
 */
import { deallocateRoom } from "@/lib/google/hostelSheet";
import { HostelApiResponse } from "@/types/hostel";

export async function deallocateHostelRoom(studentId: string): Promise<HostelApiResponse> {
  try {
    console.log('[ACTION] deallocateHostelRoom called for studentId:', studentId);
    const result = await deallocateRoom(studentId);
    console.log('[ACTION] deallocateRoom returned:', result);

    if (result) {
      return { success: true, message: `Successfully deallocated room for ${studentId}` };
    }
    return { success: false, message: `Unable to deallocate room for ${studentId}. Student may not have an allocated room.` };
  } catch (error) {
    console.error('[ACTION] Error in deallocateHostelRoom:', error);
    return { success: false, message: (error as Error).message };
  }
}

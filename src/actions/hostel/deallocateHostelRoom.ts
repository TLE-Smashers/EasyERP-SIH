/**
 * Deallocate hostel room for a student (action wrapper)
 */
import { deallocateRoom } from "@/lib/google/hostelSheet";
import { HostelApiResponse } from "@/types/hostel";

export async function deallocateHostelRoom(studentId: string): Promise<HostelApiResponse> {
  try {
    const result = await deallocateRoom(studentId);
    if (result) {
      return { success: true, message: `Deallocated ${studentId}` };
    }
    return { success: false, message: `Unable to deallocate ${studentId}` };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

/**
 * Allocate hostel room to a student
 */
import { allocateRoom, updateHostelApplicationStatus } from "@/lib/google/hostelSheet";
import { HostelApiResponse } from "@/types/hostel";

export async function allocateHostelRoom(studentId: string, gender: "male" | "female"): Promise<HostelApiResponse<{ roomNumber: string }>> {
  try {
    const room = await allocateRoom(studentId, gender);
    if (room) {
      await updateHostelApplicationStatus(studentId, "allocated", room.roomNumber);
      return { success: true, message: `Room ${room.roomNumber} allocated.`, data: { roomNumber: room.roomNumber } };
    } else {
      return { success: false, message: "No available room." };
    }
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

/**
 * Confirm hostel allocation after payment
 */
import { updateHostelApplicationStatus } from "@/lib/google/hostelSheet";
import { HostelApiResponse } from "@/types/hostel";

export async function confirmHostelAllocation(studentId: string): Promise<HostelApiResponse> {
  try {
    await updateHostelApplicationStatus(studentId, "confirmed");
    return { success: true, message: "Hostel allocation confirmed." };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

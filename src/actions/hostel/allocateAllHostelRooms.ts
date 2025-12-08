import { fetchHostelApplications, fetchHostelRooms, allocateRoom } from "@/lib/google/hostelSheet";
import { HostelApplication } from "@/types/hostel";

/**
 * Allocate all unallocated students to available rooms for a gender
 * Returns: { allocated: string[], notAllocated: string[] }
 */
export async function allocateAllHostelRooms(gender: "male" | "female") {
  // Fetch all applications (once) and sort unallocated students
  const applications = await fetchHostelApplications();
  const unallocated = applications
    .filter(app => app.gender.toLowerCase() === gender && app.status === "pending")
    .sort((a, b) => {
      if (b.entrancePercentage !== a.entrancePercentage) {
        return b.entrancePercentage - a.entrancePercentage;
      }
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

  const allocated: string[] = [];
  const notAllocated: string[] = [];

  for (const student of unallocated) {
    // Always try allocation with latest sheet state
    const result = await allocateRoom(student.studentId, gender);
    if (result) {
      allocated.push(student.studentId);
    } else {
      notAllocated.push(student.studentId);
    }
  }

  return { allocated, notAllocated };
}

import { fetchHostelApplications, fetchHostelRooms, allocateRoom } from "@/lib/google/hostelSheet";
import { HostelApplication } from "@/types/hostel";

/**
 * Allocate all unallocated students to available rooms for a gender
 * Returns: { allocated: string[], notAllocated: string[] }
 */
export async function allocateAllHostelRooms(gender: "male" | "female") {
  console.log('[ALLOCATE ALL] Starting bulk allocation for gender:', gender);
  // Fetch all applications (once) and sort unallocated students
  const applications = await fetchHostelApplications();
  console.log('[ALLOCATE ALL] Total applications:', applications.length);

  // Normalize gender for comparison
  const normalizedGender = gender.toLowerCase();

  const unallocated = applications
    .filter(app => {
      const matchesGender = app.gender === normalizedGender;
      const matchesStatus = app.status === "pending" || app.status === "deallocated";
      console.log('[ALLOCATE ALL] Checking', app.studentId, '- gender:', app.gender, 'vs', normalizedGender, '=', matchesGender, ', status:', app.status, '=', matchesStatus);
      return matchesGender && matchesStatus;
    })
    .sort((a, b) => {
      if (b.entrancePercentage !== a.entrancePercentage) {
        return b.entrancePercentage - a.entrancePercentage;
      }
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

  console.log('[ALLOCATE ALL] Pending/deallocated students to allocate:', unallocated.length);
  console.log('[ALLOCATE ALL] Student IDs:', unallocated.map(s => s.studentId));

  const allocated: string[] = [];
  const notAllocated: string[] = [];

  for (const student of unallocated) {
    console.log('[ALLOCATE ALL] Attempting allocation for:', student.studentId);
    // Always try allocation with latest sheet state
    const result = await allocateRoom(student.studentId, gender);
    if (result) {
      console.log('[ALLOCATE ALL] Successfully allocated:', student.studentId, 'to room:', result.roomNumber);
      allocated.push(student.studentId);
    } else {
      console.log('[ALLOCATE ALL] Failed to allocate:', student.studentId);
      notAllocated.push(student.studentId);
    }
  }

  console.log('[ALLOCATE ALL] Complete - Allocated:', allocated.length, 'Not allocated:', notAllocated.length);
  return { allocated, notAllocated };
}

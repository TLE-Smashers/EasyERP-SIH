import { NextRequest, NextResponse } from "next/server";
import { deallocateHostelRoom } from "@/actions/hostel/deallocateHostelRoom";

export async function POST(req: NextRequest) {
  try {
    console.log('[API] Deallocate route called');
    const { studentId } = await req.json();
    console.log('[API] StudentId received:', studentId);

    if (!studentId) {
      console.error('[API] Missing studentId in request');
      return NextResponse.json({ success: false, message: "Missing studentId" }, { status: 400 });
    }

    const result = await deallocateHostelRoom(studentId);
    console.log('[API] Deallocation result:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Error in deallocate route:', error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

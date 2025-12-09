import { NextRequest, NextResponse } from "next/server";
import { allocateHostelRoom } from "@/actions/hostel/allocateHostelRoom";

export async function POST(req: NextRequest) {
  try {
    const { studentId, gender } = await req.json();
    console.log('[API ALLOCATE] Request received - studentId:', studentId, 'gender:', gender);
    if (!studentId || !gender) {
      return NextResponse.json({ success: false, message: "Missing studentId or gender" }, { status: 400 });
    }
    const result = await allocateHostelRoom(studentId, gender);
    console.log('[API ALLOCATE] Response:', JSON.stringify(result));
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API ALLOCATE] Error:', error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

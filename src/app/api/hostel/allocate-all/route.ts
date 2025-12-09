import { NextRequest, NextResponse } from "next/server";
import { allocateAllHostelRooms } from "@/actions/hostel/allocateAllHostelRooms";

export async function POST(req: NextRequest) {
  try {
    const { gender } = await req.json();
    console.log('[API ALLOCATE-ALL] Request for gender:', gender);

    if (!gender) {
      return NextResponse.json({ success: false, message: "Gender is required", allocated: [], notAllocated: [] }, { status: 400 });
    }

    const result = await allocateAllHostelRooms(gender);
    console.log('[API ALLOCATE-ALL] Result:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API ALLOCATE-ALL] Error:', error);
    return NextResponse.json({ success: false, message: (error as Error).message, allocated: [], notAllocated: [] }, { status: 500 });
  }
}

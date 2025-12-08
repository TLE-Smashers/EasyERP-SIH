import { NextRequest, NextResponse } from "next/server";
import { allocateHostelRoom } from "@/actions/hostel/allocateHostelRoom";

export async function POST(req: NextRequest) {
  try {
    const { studentId, gender } = await req.json();
    if (!studentId || !gender) {
      return NextResponse.json({ success: false, message: "Missing studentId or gender" }, { status: 400 });
    }
    const result = await allocateHostelRoom(studentId, gender);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

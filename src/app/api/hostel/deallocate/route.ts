import { NextRequest, NextResponse } from "next/server";
import { deallocateHostelRoom } from "@/actions/hostel/deallocateHostelRoom";

export async function POST(req: NextRequest) {
  try {
    const { studentId } = await req.json();
    if (!studentId) {
      return NextResponse.json({ success: false, message: "Missing studentId" }, { status: 400 });
    }
    const result = await deallocateHostelRoom(studentId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

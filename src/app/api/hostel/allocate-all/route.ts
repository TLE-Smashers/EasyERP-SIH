import { NextRequest, NextResponse } from "next/server";
import { allocateAllHostelRooms } from "@/actions/hostel/allocateAllHostelRooms";

export async function POST(req: NextRequest) {
  const { gender } = await req.json();
  const result = await allocateAllHostelRooms(gender);
  return NextResponse.json(result);
}

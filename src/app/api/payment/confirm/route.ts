import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return NextResponse.json(
      { success: false, error: "Payment confirmation failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { getFacultyById, checkDuplicateFaculty } from "@/lib/google/sheets.faculty";

/**
 * Check if faculty ID already exists or if faculty data is duplicate
 * GET /api/faculty/check-id?id=FAC001
 * GET /api/faculty/check-id?name=John&email=john@test.com&mobile=1234567890
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const facultyId = searchParams.get("id");
        const name = searchParams.get("name");
        const email = searchParams.get("email");
        const mobile = searchParams.get("mobile");
        const excludeId = searchParams.get("excludeId"); // For edit mode

        // Check faculty ID
        if (facultyId) {
            const existingFaculty = await getFacultyById(facultyId);
            return NextResponse.json({
                exists: existingFaculty !== null,
                facultyId,
                type: "id",
            });
        }

        // Check duplicate by name, email, and mobile
        if (name && email && mobile) {
            const duplicateFaculty = await checkDuplicateFaculty(name, email, mobile, excludeId || undefined);
            return NextResponse.json({
                exists: duplicateFaculty !== null,
                faculty: duplicateFaculty ? {
                    facultyId: duplicateFaculty.facultyId,
                    fullName: duplicateFaculty.fullName,
                } : null,
                type: "duplicate",
            });
        }

        return NextResponse.json(
            { error: "Either faculty ID or name+email+mobile is required" },
            { status: 400 }
        );
    } catch (error) {
        console.error("Error checking faculty:", error);
        return NextResponse.json(
            { error: "Failed to check faculty" },
            { status: 500 }
        );
    }
}

"use server";

import { saveExamScores, checkExistingScores, type ExamScoreInput } from "@/lib/google/sheets.examScores";

/**
 * Submit exam scores for multiple students
 */
export async function submitExamScores(scores: ExamScoreInput[]) {
  try {
    // Validate scores
    if (!scores || scores.length === 0) {
      return {
        success: false,
        message: "No scores to submit",
      };
    }

    // Check if scores already exist
    const firstScore = scores[0];
    const exists = await checkExistingScores(
      firstScore.branch,
      firstScore.currentYear,
      firstScore.currentSemester,
      firstScore.examType,
      firstScore.subjectCode,
      firstScore.academicYear
    );

    if (exists) {
      return {
        success: false,
        message: "Scores for this subject and exam type already exist. Please contact admin to update.",
      };
    }

    const result = await saveExamScores(scores);
    return result;
  } catch (error) {
    console.error("[submitExamScores] Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to submit exam scores",
    };
  }
}

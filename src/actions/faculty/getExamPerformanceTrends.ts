"use server";

import { fetchExamScores } from "@/lib/google/sheets.examScores";

interface ExamPerformanceData {
  exam: string;
  average: number;
  highest: number;
  lowest: number;
  passRate: number;
}

export async function getExamPerformanceTrends(
  branch?: string,
  year?: number,
  semester?: number,
  academicYear?: string
): Promise<{
  success: boolean;
  data?: ExamPerformanceData[];
  message?: string;
}> {
  try {
    const scores = await fetchExamScores({
      branch,
      year,
      semester,
      academicYear,
    });

    if (scores.length === 0) {
      return {
        success: true,
        data: [],
        message: "No exam scores found",
      };
    }

    // Group by exam type
    const examGroups: { [key: string]: typeof scores } = {};
    scores.forEach((score) => {
      if (!examGroups[score.examType]) {
        examGroups[score.examType] = [];
      }
      examGroups[score.examType].push(score);
    });

    // Calculate statistics for each exam type
    const performanceData: ExamPerformanceData[] = [];
    const examOrder = ["Mid-1", "Mid-2", "End-Sem", "Practical"];

    examOrder.forEach((examType) => {
      const examScores = examGroups[examType];
      if (!examScores || examScores.length === 0) return;

      const percentages = examScores.map((score) => 
        score.maxMarks > 0 ? (score.marksObtained / score.maxMarks) * 100 : 0
      );

      const average = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
      const highest = Math.max(...percentages);
      const lowest = Math.min(...percentages);
      const passCount = percentages.filter((p) => p >= 40).length;
      const passRate = (passCount / percentages.length) * 100;

      performanceData.push({
        exam: examType,
        average: Math.round(average * 100) / 100,
        highest: Math.round(highest * 100) / 100,
        lowest: Math.round(lowest * 100) / 100,
        passRate: Math.round(passRate * 100) / 100,
      });
    });

    return {
      success: true,
      data: performanceData,
    };
  } catch (error) {
    console.error("Error fetching exam performance trends:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch performance trends",
    };
  }
}

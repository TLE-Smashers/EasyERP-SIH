"use server";

import { fetchAllApplications } from "@/lib/google/sheets.admission";
import type { Application as FullApplication } from "@/types/admission";

// Simplified interface for the applications list view
export interface Application {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  status: string;
  documentsVerified: boolean;
  locked: boolean;
  rowIndex: number;
}

export async function getApplications(): Promise<Application[]> {
  try {
    const fullApplications = await fetchAllApplications();
    
    // Transform to simplified list view format
    const applications: Application[] = fullApplications.map((app: FullApplication) => ({
      id: app.id,
      timestamp: app.timestamp,
      name: app.personalDetails.fullName,
      email: app.personalDetails.email,
      phone: app.personalDetails.mobileNumber,
      course: app.academicDetails.course,
      status: app.applicationStatus,
      documentsVerified: app.documentsVerified,
      locked: app.locked,
      rowIndex: app.rowNumber || 0,
    }));

    return applications;
  } catch (error) {
    console.error("Error fetching applications:", error);
    throw new Error("Failed to fetch applications");
  }
}

export async function getApplicationsByStatus(status: string): Promise<Application[]> {
  try {
    const applications = await getApplications();
    return applications.filter((app) => app.status === status);
  } catch (error) {
    console.error("Error fetching applications by status:", error);
    throw new Error("Failed to fetch applications by status");
  }
}

export async function getApplicationStats() {
  try {
    const applications = await getApplications();
    
    const stats = {
      total: applications.length,
      pending: applications.filter((app) => app.status === "pending").length,
      verified: applications.filter((app) => app.status === "documents_verified").length,
      paymentPending: applications.filter((app) => app.status === "payment_pending").length,
      completed: applications.filter((app) => app.status === "completed").length,
      rejected: applications.filter((app) => app.status === "rejected").length,
    };
    
    return stats;
  } catch (error) {
    console.error("Error fetching application stats:", error);
    throw new Error("Failed to fetch application stats");
  }
}

/**
 * Fetch hostel applications (for dashboard/admin)
 */
import { fetchHostelApplications } from "@/lib/google/hostelSheet";
import { HostelApiResponse, HostelApplication } from "@/types/hostel";

export async function getHostelApplications(): Promise<HostelApiResponse<HostelApplication[]>> {
  try {
    const applications = await fetchHostelApplications();
    return { success: true, message: "Fetched hostel applications", data: applications };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

/**
 * Get hostel application statistics for dashboard
 */
export async function getHostelApplicationStats() {
  try {
    const applications = await fetchHostelApplications();

    const stats = {
      total: applications.length,
      pending: applications.filter((app) => app.status === "pending").length,
      allocated: applications.filter((app) => app.status === "allocated").length,
      confirmed: applications.filter((app) => app.status === "confirmed").length,
      rejected: applications.filter((app) => app.status === "rejected").length,
      maleHostel: applications.filter((app) => app.gender === "male").length,
      femaleHostel: applications.filter((app) => app.gender === "female").length,
      paymentPending: applications.filter((app) => app.status === "allocated" && !app.paymentConfirmed).length,
    };

    return stats;
  } catch (error) {
    console.error("Error fetching hostel application stats:", error);
    throw new Error("Failed to fetch hostel application stats");
  }
}

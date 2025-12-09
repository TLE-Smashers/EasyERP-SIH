import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import SuperAdminDashboard from "@/components/super-admin/dashboard";

export const metadata: Metadata = {
  title: "Super Admin Dashboard | Easy ERP",
  description: "Manage institutions, resources, and system-wide settings",
};

export default async function SuperAdminPage() {
  const session = await auth();

  // Check if user is authenticated
  if (!session || !session.user) {
    redirect("/login");
  }

  const userRole = session.user.role;

  // Check if user has super-admin role
  if (userRole !== "super-admin") {
    redirect("/dashboard");
  }

  return <SuperAdminDashboard />;
}

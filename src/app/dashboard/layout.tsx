import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "@/components/dashboard-layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { user } = session;

  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>;
}
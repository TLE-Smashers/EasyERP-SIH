import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import InstitutionsListView from "@/components/super-admin/institutions-list";
export const metadata: Metadata = {
  title: "Institutions Management | Super Admin",
  description: "Manage all registered institutions",
};

export default async function InstitutionsPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  if ((session.user as any).role !== "super-admin") {
    redirect("/dashboard");
  }

  return <InstitutionsListView />;
}

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import AddInstitutionForm from "@/components/super-admin/add-institution-form";

export const metadata: Metadata = {
  title: "Add Institution | Super Admin",
  description: "Onboard a new institution to the ERP system",
};

export default async function AddInstitutionPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  if ((session.user as any).role !== "super-admin") {
    redirect("/dashboard");
  }

  return <AddInstitutionForm />;
}

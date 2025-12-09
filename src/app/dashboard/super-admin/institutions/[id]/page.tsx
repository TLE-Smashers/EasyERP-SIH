import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import InstitutionDetailsView from "@/components/super-admin/institution-details";

export const metadata: Metadata = {
  title: "Institution Details | Super Admin",
  description: "View and manage institution details",
};

interface Props {
  params: {
    id: string;
  };
}

export default async function InstitutionDetailsPage({ params }: Props) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  if ((session.user as any).role !== "super-admin") {
    redirect("/dashboard");
  }

  return <InstitutionDetailsView institutionId={params.id} />;
}

/**
 * Application Form Preview Page
 * Displays complete application details in a systematic manner with PDF export
 */

import { notFound } from "next/navigation";
import { fetchApplication } from "@/actions/admission/fetchApplication";
import { ApplicationPreviewClient } from "./ApplicationPreviewClient";

export const dynamic = "force-dynamic";

interface ApplicationPreviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ApplicationPreviewPage({
  params,
}: ApplicationPreviewPageProps) {
  // Await the params Promise
  const { id } = await params;
  
  const result = await fetchApplication(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <ApplicationPreviewClient application={result.data} />
      </div>
    </div>
  );
}

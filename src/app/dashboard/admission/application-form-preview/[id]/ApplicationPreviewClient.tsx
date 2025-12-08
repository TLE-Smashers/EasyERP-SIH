/**
 * Application Preview Client Component
 * Displays application details systematically with PDF download
 */

"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Application } from "@/types/admission";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { formatDateForDisplay } from "@/lib/dateUtils";
import { downloadPDF } from "@/lib/pdf-utils";

interface ApplicationPreviewClientProps {
  application: Application;
}

export function ApplicationPreviewClient({
  application,
}: ApplicationPreviewClientProps) {
  const router = useRouter();
  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    const filename = `Application_${application.id}_${new Date().toISOString().split("T")[0]}.pdf`;
    await downloadPDF(previewRef.current, filename);
  };

  const handlePrint = () => {
    if (!previewRef.current) return;
    
    // Create a new window for printing
    const printWindow = window.open("", "", "height=600,width=900");
    if (printWindow) {
      const printContent = previewRef.current.innerHTML;
      printWindow.document.write(`
        <html>
          <head>
            <title>Application Form - ${application.id}</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                padding: 20px;
                color: #1f2937;
              }
              @media print {
                body { padding: 0; }
                button { display: none; }
              }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "documents_verified":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-3">
          <Button
            onClick={ () => window.print()}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
          >
            <Download className="h-4 w-4" />
            Download as PDF
          </Button>

          {/* <Button
            onClick={handlePrint}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
          >
            <FileText className="h-4 w-4" />
            Print
          </Button> */}
        </div>
      </div>

      {/* Main Preview Content */}
      <div ref={previewRef} className="space-y-6 bg-white p-8 rounded-lg shadow-sm">
        {/* Title & Status */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Application Form</h1>
              <p className="text-sm text-slate-500 mt-1">
                Application ID: {application.id}
              </p>
            </div>
            <div className="text-right space-y-2">
              <Badge variant={getStatusBadgeVariant(application.applicationStatus)}>
                {application.applicationStatus.replace("_", " ").toUpperCase()}
              </Badge>
              <p className="text-xs text-slate-500">
                Submitted: {formatDateForDisplay(application.timestamp)}
              </p>
            </div>
          </div>
          <Separator />
        </div>

        {/* Personal Details Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
              1
            </span>
            Personal Information
          </h2>
          <Card className="border-0 bg-slate-50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Full Name
                  </p>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {application.personalDetails.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Email Address
                  </p>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {application.personalDetails.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Mobile Number
                  </p>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {application.personalDetails.mobileNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Date of Birth
                  </p>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {formatDateForDisplay(application.personalDetails.dateOfBirth)}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Address
                  </p>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {application.personalDetails.address}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Guardian Name
                  </p>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {application.personalDetails.guardianName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Guardian Contact
                  </p>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {application.personalDetails.guardianContact}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Academic Details Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">
              2
            </span>
            Academic Details
          </h2>
          <Card className="border-0 bg-slate-50">
            <CardContent className="pt-6 space-y-6">
              {/* 10th Standard */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">10th Standard</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      School
                    </p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {application.academicDetails.school10th}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Board
                    </p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {application.academicDetails.board10th}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Marks / Percentage
                    </p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {application.academicDetails.marks10th}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Year of Passing
                    </p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {application.academicDetails.yearOfPassing10th}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-200" />

              {/* 12th Standard */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">12th Standard</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      School
                    </p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {application.academicDetails.school12th}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Board
                    </p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {application.academicDetails.board12th}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Marks / Percentage
                    </p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {application.academicDetails.marks12th}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Year of Passing
                    </p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {application.academicDetails.yearOfPassing12th}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-200" />

              {/* Course Selection */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Course Selection</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Course
                    </p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {application.academicDetails.course}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Branch
                    </p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {application.academicDetails.branch}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">
              3
            </span>
            Uploaded Documents
          </h2>
          <Card className="border-0 bg-slate-50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(application.documentLinks).map(([key, value]) => {
                  if (!value) return null;
                  const label = key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim();
                  return (
                    <div key={key} className="p-3 bg-white rounded border border-slate-200">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {label}
                      </p>
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 underline mt-1 block truncate"
                      >
                        View Document
                      </a>
                    </div>
                  );
                })}
              </div>
              {Object.values(application.documentLinks).every((v) => !v) && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No documents uploaded
                </p>
              )}
            </CardContent>
          </Card>

          {/* Document Verification Status */}
          {application.documentsVerified && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">Documents Verified</p>
                    <p className="text-sm text-green-700 mt-1">
                      Verified by: {application.verifiedBy || "Admin"}
                    </p>
                    {application.verificationDate && (
                      <p className="text-sm text-green-700">
                        Date: {formatDateForDisplay(application.verificationDate)}
                      </p>
                    )}
                    {application.verificationNotes && (
                      <p className="text-sm text-green-700 mt-2">
                        Notes: {application.verificationNotes}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Completion Details Section */}
        {application.completionDetails && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-sm font-bold">
                4
              </span>
              Completion Details
            </h2>
            <Card className="border-0 bg-slate-50">
              <CardContent className="pt-6">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Final Remarks
                  </p>
                  <p className="text-sm text-slate-900 mt-2 whitespace-pre-wrap">
                    {application.completionDetails.finalRemarks || "No remarks provided"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lock Status */}
        <div className="bg-slate-100 p-4 rounded-lg space-y-2 border-l-4 border-slate-400">
          <p className="text-sm font-semibold text-slate-700">
            {application.locked ? "🔒 Application Locked" : "🔓 Application Open"}
          </p>
          {application.lockedDate && (
            <p className="text-xs text-slate-600">
              Locked on: {formatDateForDisplay(application.lockedDate)}
              {application.lockedBy && ` by ${application.lockedBy}`}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>This is an official application record. Please keep a copy for your reference.</p>
          <p className="mt-2">Generated on: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

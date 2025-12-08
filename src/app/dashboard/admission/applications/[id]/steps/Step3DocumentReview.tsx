/**
 * Step 3: Document Verification
 * Review and verify uploaded documents
 */

"use client";

import { useState } from "react";
import { Application } from "@/types/admission";
import { verifyDocuments } from "@/actions/admission/verifyDocuments";
import { formatDateForDisplay } from "@/lib/dateUtils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Loader2, 
  FileCheck, 
  ExternalLink, 
  Download,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface Step3DocumentReviewProps {
  application: Application;
  onVerified?: () => void;
}

const documentFields = [
  { key: "marksheet10th", label: "10th Marksheet", required: true },
  { key: "marksheet12th", label: "12th Marksheet", required: true },
  { key: "entranceExamMarksheet", label: "Entrance Exam Marksheet", required: false },
  { key: "allotmentLetter", label: "Allotment Letter", required: false },
  { key: "transferCertificate", label: "Transfer Certificate", required: false },
  { key: "characterCertificate", label: "Character Certificate", required: false },
  { key: "domicile", label: "Domicile Certificate", required: false },
  { key: "casteCertificate", label: "Caste Certificate", required: false },
  { key: "idProof", label: "ID Proof / Aadhar Card", required: true },
  { key: "photo", label: "Passport Size Photo", required: true },
  { key: "gapCertificate", label: "Gap Certificate (if applicable)", required: false },
];

export function Step3DocumentReview({ application, onVerified }: Step3DocumentReviewProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [allDocsVerified, setAllDocsVerified] = useState(application.documentsVerified);
  const [notes, setNotes] = useState(application.verificationNotes || "");

  const handleVerify = async () => {
    if (!allDocsVerified) {
      toast.error("Please check the verification checkbox before proceeding");
      return;
    }

    setIsVerifying(true);
    
    const result = await verifyDocuments(application.id, notes);

    setIsVerifying(false);

    if (result.success) {
      toast.success("Documents verified successfully! Student will be notified via email.");
      onVerified?.();
    } else {
      toast.error(result.error || "Failed to verify documents");
    }
  };

  const isLocked = application.locked;
  const isAlreadyVerified = !!(application.documentsVerified && application.verifiedBy);

  return (
    <div className="space-y-6">
      {/* Already Verified Banner */}
      {isAlreadyVerified && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-600">Documents Verified</p>
                <p className="text-sm text-muted-foreground">
                  Verified by <strong>{application.verifiedBy}</strong> on{" "}
                  {formatDateForDisplay(application.verificationDate!)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">📄 Uploaded Documents</h3>
          <Badge variant="outline" className="text-xs">
            {Object.values(application.documentLinks).filter(Boolean).length} / {documentFields.length} uploaded
          </Badge>
        </div>
        
        {/* Info Banner */}
        <Card className="border-blue-500/30 bg-blue-500/5 mb-4">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">
              📎 Documents are stored in Google Drive. Click <strong>View</strong> to open them in a new tab.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {documentFields.map((doc) => {
            const url = application.documentLinks[doc.key as keyof typeof application.documentLinks];
            const hasDocument = !!url;

            return (
              <Card key={doc.key} className={hasDocument ? "" : "border-orange-500/30"}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {hasDocument ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                      )}
                      <div>
                        <p className="font-medium">{doc.label}</p>
                        {doc.required && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>

                    {hasDocument ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(url, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(url, "_blank")}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-orange-600">
                        Not Uploaded
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Verification Notes */}
      {!isLocked && (
        <>
          <div className="space-y-2">
            <Label htmlFor="notes">Verification Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any comments or observations about the documents..."
              rows={4}
              disabled={isAlreadyVerified}
            />
          </div>

          {/* Verification Checkbox */}
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="verify-all"
                  checked={allDocsVerified}
                  onCheckedChange={(checked) => setAllDocsVerified(checked as boolean)}
                  disabled={isAlreadyVerified}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="verify-all"
                    className="text-base font-medium cursor-pointer"
                  >
                    All required documents verified and approved
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    By checking this box, you confirm that you have reviewed all uploaded
                    documents and they meet the admission criteria.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              onClick={handleVerify}
              disabled={!allDocsVerified || isVerifying || isAlreadyVerified}
              size="lg"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <FileCheck className="mr-2 h-4 w-4" />
                  Verify & Continue →
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

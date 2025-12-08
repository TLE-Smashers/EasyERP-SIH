"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { restoreBackup } from "@/actions/backup";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Restore Backup Component
 * Allows uploading JSON backup and restoring to Google Sheets
 */
export function RestoreBackup({ onSuccess }: { onSuccess?: () => void }) {
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupData, setBackupData] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate backup format
      if (!data.admissions || !Array.isArray(data.admissions)) {
        toast.error("Invalid backup format");
        return;
      }

      setBackupData(data);
      setShowConfirmDialog(true);
      toast.success(`Backup loaded: ${data.admissions.length} records found`);
    } catch (error) {
      toast.error("Failed to read backup file");
      console.error("File read error:", error);
    }

    // Reset input
    e.target.value = "";
  };

  const handleRestore = async () => {
    if (!backupData) return;

    setIsRestoring(true);
    setShowConfirmDialog(false);

    try {
      toast.info("Restoring backup...");
      await restoreBackup(backupData);
      toast.success(`Successfully restored ${backupData.admissions.length} records!`);
      setBackupData(null);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to restore backup");
      console.error("Restore error:", error);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Restore from Backup
          </CardTitle>
          <CardDescription>
            Upload a JSON backup file to restore data to Google Sheets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={isRestoring}
                className="hidden"
                id="backup-upload"
              />
              <label
                htmlFor="backup-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    Click to upload backup file
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JSON format only
                  </p>
                </div>
              </label>
            </div>

            {backupData && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Backup ready to restore
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      {backupData.admissions.length} admission records found
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    <strong>Warning:</strong> This will replace all existing
                    data in the sheet. Make sure to create a backup before
                    restoring.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Confirm Restore
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to restore <strong>{backupData?.admissions.length} records</strong> to Google Sheets.
              </p>
              <p className="text-amber-600 dark:text-amber-400 font-medium">
                This will replace all existing data. This action cannot be undone.
              </p>
              <p>Make sure you have a backup before proceeding.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              disabled={isRestoring}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRestoring ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                "Yes, Restore"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

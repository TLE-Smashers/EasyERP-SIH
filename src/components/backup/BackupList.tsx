"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Backup } from "@/types/backup";
import { deleteBackup } from "@/actions/backup";
import { toast } from "sonner";

interface BackupListProps {
  backups: Backup[];
  onUpdate?: () => void;
}

/**
 * Simple Backup List Component
 * Following SOLID principles - Single Responsibility
 */
export function BackupList({ backups, onUpdate }: BackupListProps) {
  const handleDelete = async (id: string) => {
    try {
      await deleteBackup(id);
      toast.success("Backup deleted successfully");
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to delete backup");
    }
  };

  const handleDownload = (backup: Backup) => {
    try {
      // Download actual backup data
      const a = document.createElement("a");
      a.href = backup.downloadUrl || "#";
      a.download = `${backup.name.replace(/\s+/g, "_")}_${backup.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Backup downloaded");
    } catch (error) {
      toast.error("Failed to download backup");
      console.error("Download error:", error);
    }
  };

  const getStatusIcon = (status: Backup["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: Backup["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="text-xs">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive" className="text-xs">Failed</Badge>;
      case "pending":
        return <Badge variant="secondary" className="text-xs">Pending</Badge>;
    }
  };

  if (backups.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">No backups found</div>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first backup to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {backups.map((backup) => (
        <Card key={backup.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {getStatusIcon(backup.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{backup.name}</p>
                  {getStatusBadge(backup.status)}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span>{new Date(backup.createdAt).toLocaleString()}</span>
                  {backup.size && (
                    <>
                      <span>•</span>
                      <span>{backup.size}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="text-blue-600">{backup.type}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {backup.status === "completed" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(backup)}
                  className="h-8 text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(backup.id)}
                className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

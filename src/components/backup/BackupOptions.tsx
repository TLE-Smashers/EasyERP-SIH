"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Download, Loader2 } from "lucide-react";
import { createBackup } from "@/actions/backup";
import { toast } from "sonner";

interface BackupOptionProps {
  title: string;
  description: string;
  type: string;
  icon: React.ReactNode;
  onSuccess?: () => void;
}

/**
 * Simple Backup Option Card
 * Following SOLID principles - Single Responsibility
 */
export function BackupOption({ title, description, type, icon, onSuccess }: BackupOptionProps) {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      toast.info(`Creating ${title}...`);
      const backup = await createBackup(type);
      toast.success(`${title} created successfully! Size: ${backup.size}`);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to create backup");
      console.error("Backup error:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleCreateBackup}
          disabled={isCreating}
          className="w-full"
          size="sm"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Create Backup
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Predefined Backup Options
 */
export function BackupOptions({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <BackupOption
        title="Full System Backup"
        description="Complete backup of all modules"
        type="Full System"
        icon={<Database className="w-5 h-5 text-blue-600" />}
        onSuccess={onSuccess}
      />
      <BackupOption
        title="Admission Data"
        description="Backup admission records only"
        type="Admission Data"
        icon={<Database className="w-5 h-5 text-green-600" />}
        onSuccess={onSuccess}
      />
      <BackupOption
        title="Student Data"
        description="Backup student information"
        type="Student Records"
        icon={<Database className="w-5 h-5 text-purple-600" />}
        onSuccess={onSuccess}
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Database, Shield, Info } from "lucide-react";
import { BackupOptions } from "@/components/backup/BackupOptions";
import { BackupList } from "@/components/backup/BackupList";
import { RestoreBackup } from "@/components/backup/RestoreBackup";
import { getBackups } from "@/actions/backup";
import { Backup } from "@/types/backup";

/**
 * Simple Backup Dashboard Page for Prototype
 * Following SOLID principles - Single Responsibility
 */
export default function BackupPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBackups = async () => {
    try {
      const data = await getBackups();
      setBackups(data);
    } catch (error) {
      console.error("Failed to load backups:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Backup</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage system backups
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backups.length}</div>
            <p className="text-xs text-muted-foreground">
              {backups.filter((b) => b.status === "completed").length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Backup</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backups.length > 0
                ? new Date(backups[0].createdAt).toLocaleDateString()
                : "Never"}
            </div>
            <p className="text-xs text-muted-foreground">
              {backups.length > 0 ? backups[0].type : "No backups yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backups
                .reduce((sum, b) => {
                  const size = parseFloat(b.size?.split(" ")[0] || "0");
                  return sum + size;
                }, 0)
                .toFixed(2)}{" "}
              MB
            </div>
            <p className="text-xs text-muted-foreground">Across all backups</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Backup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Create New Backup
            <Badge variant="secondary" className="text-xs">
              Prototype
            </Badge>
          </CardTitle>
          <CardDescription>
            Choose the type of backup you want to create
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BackupOptions onSuccess={loadBackups} />
        </CardContent>
      </Card>

      {/* Restore Backup Section */}
      <RestoreBackup onSuccess={loadBackups} />

      {/* Backup History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>View and manage your backups</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadBackups}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading backups...</p>
            </div>
          ) : (
            <BackupList backups={backups} onUpdate={loadBackups} />
          )}
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Backup & Restore System
              </p>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-xs">
                <li>• <strong>Create Backup:</strong> Exports real data from Google Sheets as JSON</li>
                <li>• <strong>Restore Backup:</strong> Upload JSON file to restore data to Google Sheets</li>
                <li>• <strong>Warning:</strong> Restore will replace all existing data - backup first!</li>
                <li>• Full automated backup scheduling will be added in production phase</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
